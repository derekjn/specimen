import { select_keys, uuidv4, cycle_array } from './util';

function choose_lowest_timestamp(collections, offsets) {
  let choices = []

  Object.entries(collections).forEach(([name, { partitions }]) => {
    Object.entries(partitions).forEach(([id, partition]) => {
      const offset = offsets[name][id];

      if (partition[offset] != undefined) {
        const props = { collection: name, partition: id };
        choices.push({ ...partition[offset], ...props });
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

function without_sinks(colls, sinks) {
  return Object.entries(colls).reduce((all, [name, coll]) => {
    if (!sinks.includes(coll.name)) {
      all[name] = coll;
    }

    return all;
  }, {});
}

function is_drained(non_sinks, offsets) {
  return Object.entries(offsets).every(([pq, colls]) => {
    return Object.entries(colls).every(([coll, partitions]) => {
      return Object.entries(partitions).every(([partition, offset]) => {
        return offset == non_sinks[coll].partitions[partition].length;
      });
    });
  });
}

function swap_partitions(pq, colls, offsets, old_row, new_row) {
  new_row.offset = colls[new_row.collection].partitions[new_row.partition].length;
  colls[new_row.collection].partitions[new_row.partition].push(new_row);
  offsets[pq][old_row.collection][old_row.partition]++;
}

function initialize_offsets(specimen, pqs, colls) {
  return pqs.reduce((all_pqs, pq) => {
    const parent_colls = specimen.parents(pq);

    const coll_offsets = parent_colls.reduce((all_colls, parent) => {
      const partitions = Object.keys(colls[parent].partitions);

      const partition_offsets = partitions.reduce((all_partitions, partition) => {
        all_partitions[partition] = 0;
        return all_partitions;
      }, {});

      all_colls[parent] = partition_offsets;
      return all_colls;
    }, {});

    all_pqs[pq] = coll_offsets;
    return all_pqs;
  }, {});
}

function set_new_collection(new_row, into) {
  new_row.collection = into;
}

function set_new_partition(context, new_row, partition_by) {
  if (partition_by) {
    new_row.partition = partition_by(context, new_row);
  }
}

function clone_offsets(m) {
  return Object.entries(m)
    .reduce((acc, [k, v])=> (acc[k]={...v}, acc), {});
}

export function run_until_drained(specimen) {
  const kinds = specimen.node_kinds();
  const colls = kinds.collection;
  const pqs = kinds.persistent_query;
  const sinks = specimen.sink_collections();
  const non_sinks = without_sinks(colls, sinks);

  let pq_seq = Object.keys(pqs);
  let actions = [];
  let lineage = {};
  let offsets = initialize_offsets(specimen, pq_seq, colls);

  while (!is_drained(non_sinks, offsets)) {
    const pq = pq_seq[0];
    const parents = specimen.parents(pq);
    const parent_colls = select_keys(colls, parents);
    
    const old_row = choose_lowest_timestamp(parent_colls, offsets[pq]);
    const old_offsets = clone_offsets(offsets[pq]);

    if (old_row) {
      const { into, partition_by } = pqs[pq];
      const new_row = { ...old_row };

      const context = {
        partitions: Object.keys(colls[into].partitions).length
      };

      set_new_collection(new_row, into);
      set_new_partition(context, new_row, partition_by);

      old_row.id = uuidv4();
      new_row.derived_id = old_row.id;

      swap_partitions(pq, colls, offsets, old_row, new_row);

      if (old_row.derived_id) {
        lineage[old_row.id] = old_row.derived_id;
      } else {
        old_row.derived_id = old_row.source_id;
      }

      const action = {
        from: old_row.collection,
        to: new_row.collection,
        processed_by: pq,
        old_row: old_row,
        new_row: new_row,
        offsets: clone_offsets(offsets[pq]),
        old_offsets: old_offsets
      };

      actions.push(action);
    }
    
    pq_seq = cycle_array(pq_seq);
  }

  return {
    actions: actions,
    lineage: lineage
  };
}
