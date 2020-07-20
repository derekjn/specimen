function choose_lowest_timestamp(collections) {
  let choices = []

  Object.entries(collections).forEach(([name, { partitions }]) => {
    Object.entries(partitions).forEach(([id, partition]) => {
      if (partition.length > 0) {
        const props = { collection: name, partition: id };
        choices.push({ ...partition[0], ...props });
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
      all.push(coll);
    }

    return all;
  }, []);
}

function is_drained(non_sinks) {
  return non_sinks.every(coll => {
    return Object.entries(coll.partitions).every(([partition, rows]) => {
      return rows.length == 0;
    });
  });
}

function swap_partitions(colls, offsets, old_row, new_row) {
  colls[old_row.collection].partitions[old_row.partition].shift();

  new_row.offset = offsets[new_row.collection][new_row.partition];
  offsets[new_row.collection][new_row.partition]++;
  
  colls[new_row.collection].partitions[new_row.partition].push(new_row);
}

function initialize_offsets(colls) {
  return Object.entries(colls).reduce((all, [name, { partitions }]) => {    
    all[name] = {};
    Object.entries(partitions).forEach(([partition, rows]) => {
      all[name][partition] = rows.length;
    });

    return all;
  }, {});
}

function run_until_drained(specimen) {
  const kinds = specimen.node_kinds();
  const colls = kinds.collection;
  const pqs = kinds.persistent_query;
  const sinks = specimen.sink_collections();
  const non_sinks = without_sinks(colls, sinks);

  let pq_seq = Object.keys(pqs);
  let actions = [];
  let lineage = {};
  let offsets = initialize_offsets(colls);

  while (!is_drained(non_sinks)) {
    const pq = pq_seq[0];
    const parents = specimen.parents(pq);
    const parent_colls = select_keys(colls, parents);
    const old_row = choose_lowest_timestamp(parent_colls);

    if (old_row) {
      const { fn } = pqs[pq];
      const new_row = fn(old_row);
      new_row.id = uuidv4();

      swap_partitions(colls, offsets, old_row, new_row);
      lineage[new_row.id] = old_row.id;

      const action = {
        from: old_row.collection,
        to: new_row.collection,
        processed_by: pq,
        old_row: old_row,
        new_row: new_row
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
