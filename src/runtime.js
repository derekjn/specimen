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
    } else if (row.vars.record.t < result.vars.record.t) {
      return row;
    } else {
      return result;
    }
  }, undefined);
}

function is_drained(offsets, by_name) {
  return Object.entries(offsets).every(([pq, streams]) => {
    return Object.entries(streams).every(([stream, partitions]) => {
      return Object.entries(partitions).every(([partition, offset]) => {
        const stream_data = by_name(stream);
        const partitions = stream_data.children.partitions;
        const rows = partitions[partition].children.rows;

        return offset == rows.length;
      });
    });
  });
}

function swap_partitions(by_name, pack, pq, offsets, old_row, new_row) {
  const new_stream_name = new_row.vars.record.stream;
  const new_partition = new_row.vars.record.partition;

  const new_stream_data = by_name(new_stream_name);
  const new_partition_data = new_stream_data.children.partitions[new_partition];

  new_row.vars.record.offset = new_partition_data.children.rows.length;
  new_partition_data.children.rows.push(new_row);

  const old_offset = offsets[pq][old_row.vars.record.stream][old_row.vars.record.partition];
  offsets[pq][old_row.vars.record.stream][old_row.vars.record.partition] = old_offset + 1;

  pack(new_partition_data);
}

function initialize_offsets(pqs, streams, by_name) {
  return pqs.reduce((all_pqs, pq) => {
    const parents = pq.graph.predecessors;

    const stream_offsets = parents.reduce((all_streams, parent) => {
      const parent_data = by_name(parent);
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

function repartition(context, before_row, after_row, partition_by) {
  if (partition_by) {
    const key = partition_by(context, before_row.vars.record, after_row.vars.record);
    after_row.vars.record.key = key;
    after_row.vars.record.partition = key % context.partitions;
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

function evaluate_select(runtime_context, query_context, query_parts, before_row) {
  const { by_name, pack, pq, offsets, stream_time, lineage } = runtime_context;
  const { into, partition_by } = query_parts;

  const before_offsets = cloneDeep(offsets[pq]);
  const before_stream_time = stream_time[pq];

  const after_row = { ...cloneDeep(before_row), ...{ id: uuidv4() } };

  set_new_stream(after_row, into);
  repartition(query_context, before_row, after_row, partition_by);

  after_row.vars.derived_id = before_row.id;

  swap_partitions(by_name, pack, pq, offsets, before_row, after_row);
  update_stream_time(stream_time, pq, before_row.vars.record.t);

  if (before_row.vars.derived_id) {
    lineage[before_row.id] = before_row.vars.derived_id;
  } else {
    before_row.vars.derived_id = before_row.vars.source_id;
  }

  return {
    kind: "keep",
    before: {
      row: before_row,
      offsets: before_offsets,
      stream_time: before_stream_time
    },
    after: {
      row: after_row,
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

export function init_runtime(objs, data_fns) {
  const streams = objs.filter(component => component.kind == "stream");
  const pqs = objs.filter(component => component.kind == "persistent_query");
  const pq_seq = pqs.map(pq => pq.name);

  const { by_name } = data_fns;

  return {
    streams: streams,
    pqs: pqs,
    pq_seq: pq_seq,
    offsets: initialize_offsets(pqs, streams, by_name),
    stream_time: initialize_stream_time(pq_seq),
    lineage: {},
    data_fns: data_fns
  };
}

export function tick(rt_context) {
  const { streams, pqs, offsets, stream_time, lineage, data_fns } = rt_context;
  const { by_name, pack } = data_fns;

  const drained = is_drained(offsets, by_name);
  let pq_seq = rt_context.pq_seq;
  let action = undefined;

  if (!drained) {
    const pq = pq_seq[0];
    const pq_data = by_name(pq);
    const parent_stream_names = pq_data.graph.predecessors;
    const parent_streams = parent_stream_names.map(s => by_name(s));

    const old_row = choose_lowest_timestamp(parent_streams, offsets[pq]);

    const runtime_context = {
      by_name,
      pack,
      pq,
      offsets,
      stream_time,
      lineage
    };

    if (old_row) {
      const query_parts = pq_data.vars.query_parts;
      const sink_data = by_name(query_parts.into);
      const sink_partitions = sink_data.children.partitions;
      
      const query_context = {
        partitions: sink_partitions.length
      };

      action = evaluate_select(runtime_context, query_context, query_parts, old_row);
    }

    pq_seq = cycle_array(pq_seq);

    return {
      ...rt_context,
      ...{
        drained: false,
        pq_seq: pq_seq,
        action: action
      }
    };
  } else {
    return {
      ...rt_context,
      ...{
        drained: true,
        action: action
      }
    };
  }
}
