import * as ci from "./component-index";
import { select_keys, uuidv4, cycle_array } from './util';
import cloneDeep from "lodash/cloneDeep";

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
        const rows = partitions[partition].children.rows;

        return offset == rows.length;
      });
    });
  });
}

function swap_partitions(by_id, by_name, pq, offsets, old_row, new_row) {
  const new_stream_name = new_row.vars.record.stream;
  const new_partition = new_row.vars.record.partition;

  const new_stream_data = ci.unpack(by_id, by_name[new_stream_name]);
  const new_partition_data = new_stream_data.children.partitions[new_partition];
  
  new_row.vars.record.offset = new_partition_data.children.rows.length;
  new_partition_data.children.rows.push(new_row);

  const old_offset = offsets[pq][old_row.vars.record.stream][old_row.vars.record.partition];
  offsets[pq][old_row.vars.record.stream][old_row.vars.record.partition] = old_offset + 1;

  ci.pack(new_partition_data, by_id);
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
  new_row.vars.record.stream = into;
}

function set_new_partition(context, new_row, partition_by) {
  if (partition_by) {
    const key = partition_by(context, new_row);
    new_row.key = key;
    new_row.partition = key % context.partitions;
  }
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
  const { by_id, by_name, pq, offsets, stream_time, lineage } = runtime_context;
  const { into, partition_by } = query_parts;

  const old_offsets = cloneDeep(offsets[pq]);
  const old_stream_time = stream_time[pq];

  const new_row = cloneDeep(old_row);

  set_new_stream(new_row, into);
  set_new_partition(query_context, new_row, partition_by);

  old_row.id = uuidv4();
  new_row.vars.derived_id = old_row.id;

  swap_partitions(by_id, by_name, pq, offsets, old_row, new_row);
  update_stream_time(stream_time, pq, old_row.vars.record.t);

  if (old_row.vars.derived_id) {
    lineage[old_row.id] = old_row.vars.derived_id;
  } else {
    old_row.vars.derived_id = old_row.vars.source_id;
  }

  return {
    kind: "keep",
    before: {
      row: old_row,
      offsets: old_offsets,
      stream_time: old_stream_time
    },
    after: {
      row: new_row,
      offsets: cloneDeep(offsets[pq]),
      stream_time: stream_time[pq]
    },
    processed_by: pq
  };
}

function execute_filter(runtime_context, query_context, query_parts, old_row) {
  const { offsets, stream_time, pq } = runtime_context;

  const old_offsets = cloneDeep(offsets[pq]);
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
    new_offsets: cloneDeep(offsets[pq]),
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

  while (!is_drained(offsets, by_id, by_name)) {
    const pq = pq_seq[0];
    const pq_data = ci.unpack(by_id, by_name[pq]);
    const parent_stream_names = pq_data.graph.predecessors;
    const parent_streams = parent_stream_names.map(s => ci.unpack(by_id, by_name[s]));

    const old_row = choose_lowest_timestamp(parent_streams, offsets[pq]);

    const runtime_context = {
      by_id,
      by_name,
      pq,
      offsets,
      stream_time,
      lineage
    };

    if (old_row) {
      const query_parts = pq_data.vars.query_parts;
      const sink_data = ci.unpack(by_id, by_name[query_parts.into]);
      const sink_partitions = sink_data.children.partitions;
      
      const query_context = {
        partitions: sink_partitions.length
      };

      if (false) {
        // if (where(query_context, old_row)) {
        //   const action = evaluate_select(runtime_context, query_context, query_parts, old_row);
        //   actions.push(action);
        // } else {
        //   const action = execute_filter(runtime_context, query_context, query_parts, old_row);
        //   actions.push(action);
        // }
      } else {
        const action = evaluate_select(runtime_context, query_context, query_parts, old_row);
        actions.push(action);
      }
    }

    pq_seq = cycle_array(pq_seq);
  }

  return {
    actions: actions,
    lineage: lineage
  };
}
