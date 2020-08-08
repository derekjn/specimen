import * as ci from "./component-index";
import { select_keys, uuidv4, cycle_array } from './util';

function choose_lowest_timestamp(streams, offsets) {
  let choices = []

  streams.forEach(s => {
    const { id, name, children } = s;
    const { partitions } = children;

    partitions.forEach((partition, i) => {
      const offset = offsets[name][i];
      const row = partition.children.rows[offset];

      if (row != undefined) {
        choices.push(row);
      }
    });
  });

  return choices.reduce((result, row) => {
    if (result == undefined) {
      return row;
    } else if (row.t < result.t) {
      return row;
    } else {
      return result;
    }
  }, undefined);
}

function without_sinks(streams, sinks) {
  return Object.entries(streams).reduce((all, [name, stream]) => {
    if (!sinks.includes(stream.name)) {
      all[name] = stream;
    }

    return all;
  }, {});
}

function is_drained(offsets, by_id, by_name) {
  return Object.entries(offsets).every(([pq, streams]) => {
    return Object.entries(streams).every(([stream, partitions]) => {
      return Object.entries(partitions).every(([partition, offset]) => {
        const stream_id = by_name[stream];
        const stream_data = ci.unpack(by_id, stream_id);
        const partitions = stream_data.children.partitions;

        return offset == partitions[partition].children.length;
      });
    });
  });
}

function swap_partitions(pq, streams, offsets, old_row, new_row) {
  new_row.offset = streams[new_row.stream].partitions[new_row.partition].length;
  streams[new_row.stream].partitions[new_row.partition].push(new_row);
  offsets[pq][old_row.stream][old_row.partition]++;
}

function initialize_offsets(pqs, streams, by_id, by_name) {
  return pqs.reduce((all_pqs, pq) => {
    const parents = pq.graph.predecessors;

    const stream_offsets = parents.reduce((all_streams, parent) => {
      const parent_id = by_name[parent];
      const parent_data = ci.unpack(by_id, parent_id);
      const partitions = parent_data.children.partitions;

      const partition_offsets = [...Array(partitions.length).keys()]
            .reduce((all, i) => {
              all[i] = 0;
              return all;
            }, {});

      all_streams[parent] = partition_offsets;
      return all_streams;
    }, {});

    all_pqs[pq.name] = stream_offsets;
    return all_pqs;
  }, {});
}

function set_new_stream(new_row, into) {
  new_row.stream = into;
}

function set_new_partition(context, new_row, partition_by) {
  if (partition_by) {
    const key = partition_by(context, new_row);
    new_row.key = key;
    new_row.partition = key % context.partitions;
  }
}

function clone_offsets(m) {
  return Object.entries(m)
    .reduce((acc, [k, v])=> (acc[k]={...v}, acc), {});
}

function initialize_stream_time(pqs) {
  return pqs.reduce((all, pq) => {
    all[pq] = undefined;
    return all;
  }, {});
}

function update_stream_time(stream_time, pq, t) {
  const st = stream_time[pq];

  if ((st == undefined) || (t > st)) {
    stream_time[pq] = t;
  }
}

function evaluate_select(runtime_context, query_context, query_parts, old_row) {
  const { streams, offsets, stream_time, lineage, pq } = runtime_context;
  const { into, partition_by } = query_parts;

  const old_offsets = clone_offsets(offsets[pq]);
  const old_stream_time = stream_time[pq];

  const new_row = { ...old_row };

  set_new_stream(new_row, into);
  set_new_partition(query_context, new_row, partition_by);

  old_row.id = uuidv4();
  new_row.derived_id = old_row.id;

  swap_partitions(pq, streams, offsets, old_row, new_row);
  update_stream_time(stream_time, pq, old_row.t);

  if (old_row.derived_id) {
    lineage[old_row.id] = old_row.derived_id;
  } else {
    old_row.derived_id = old_row.source_id;
  }

  return {
    kind: "keep",
    from: old_row.stream,
    to: new_row.stream,
    processed_by: pq,
    old_row: old_row,
    new_row: new_row,
    new_offsets: clone_offsets(offsets[pq]),
    old_offsets: old_offsets,
    old_stream_time: old_stream_time,
    new_stream_time: stream_time[pq]
  };
}

function execute_filter(runtime_context, query_context, query_parts, old_row) {
  const { offsets, stream_time, pq } = runtime_context;

  const old_offsets = clone_offsets(offsets[pq]);
  const old_stream_time = stream_time[pq];

  old_row.id = uuidv4();
  offsets[pq][old_row.stream][old_row.partition]++;
  update_stream_time(stream_time, pq, old_row.t);

  if (old_row.derived_id) {
    lineage[old_row.id] = old_row.derived_id;
  } else {
    old_row.derived_id = old_row.source_id;
  }


  return {
    kind: "discard",
    old_row: old_row,
    from: old_row.stream,
    processed_by: pq,
    new_offsets: clone_offsets(offsets[pq]),
    old_offsets: old_offsets,
    old_stream_time: old_stream_time,
    new_stream_time: stream_time[pq]
  };
}

export function run_until_drained(by_id, by_name) {
  const objs = Object.values(by_id)

  const streams = objs.filter(component => component.kind == "stream");
  const pqs = objs.filter(component => component.kind == "persistent_query");

  const sinks = streams.filter(s => s.graph.successors.length == 0);
  const non_sinks = streams.filter(s => s.graph.successors.length > 0);

  let pq_seq = pqs.map(pq => pq.name);
  let actions = [];
  let lineage = {};
  let offsets = initialize_offsets(pqs, streams, by_id, by_name);
  let stream_time = initialize_stream_time(pq_seq);

//  while (!is_drained(offsets, by_name, by_id)) {
    const pq = pq_seq[0];
    const pq_data = ci.unpack(by_id, by_name[pq]);
    const parent_stream_names = pq_data.graph.predecessors;
    const parent_streams = parent_stream_names.map(s => ci.unpack(by_id, by_name[s]));

  const old_row = choose_lowest_timestamp(parent_streams, offsets[pq]);

  //   const runtime_context = {
  //     pq, streams, offsets, stream_time, lineage
  //   };

  //   if (old_row) {
  //     const query_parts = pqs[pq];
  //     const { into, where, partition_by } = query_parts;
  //     const query_context = {
  //       partitions: Object.keys(streams[into].partitions).length
  //     };

  //     // if (where) {
  //     //   if (where(query_context, old_row)) {
  //     //     const action = evaluate_select(runtime_context, query_context, query_parts, old_row);
  //     //     actions.push(action);
  //     //   } else {
  //     //     const action = execute_filter(runtime_context, query_context, query_parts, old_row);
  //     //     actions.push(action);
  //     //   }
  //     // } else {
  //     //   const action = evaluate_select(runtime_context, query_context, query_parts, old_row);
  //     //   actions.push(action);
  //     // }
  //   }
    
  //   pq_seq = cycle_array(pq_seq);
  // }

  return {
    actions: actions,
    lineage: lineage
  };
}
