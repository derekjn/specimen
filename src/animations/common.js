import * as st from "./../components/stream-time";
import * as sp from "./../components/source-partition";

export function update_stream_time_text(data_fns, pq_name, row) {
  const { by_name } = data_fns;
  const pq_data = by_name(pq_name);
  const stream_time_data = pq_data.children.stream_time;

  st.update_time(stream_time_data, row);
}

export function update_pq_offsets(data_fns, pq_name, offsets) {
  const { by_name } = data_fns;
  const pq_data = by_name(pq_name);

  Object.entries(offsets).forEach(([ collection, partitions] ) => {
    Object.entries(partitions).forEach(([ partition, offset ]) => {
      const sp_data = pq_data.children.source_partitions[partition];
      const last_offset = offset - 1;

      sp.update_offset(sp_data, last_offset);
    });
  });
}
