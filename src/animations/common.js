import { select_keys } from './../util';

export function update_pq_offsets(processed_by, offsets) {
  Object.entries(offsets).forEach(([ collection, partitions] ) => {
    Object.entries(partitions).forEach(([ partition, offset ]) => {
      const el = document.querySelector(`.collection-${collection}.partition-${partition}.pq-${processed_by}`);
      const last_offset = offset - 1;

      if (last_offset < 0) {
        el.lastChild.textContent = "-";
      } else {
        el.lastChild.textContent = last_offset;
      }
    });
  });
}

export function update_row_popover(id, row) {
  const el = document.querySelector(`.row.id-${id} > title`);
  const row_data = select_keys(row, ["collection", "partition", "offset", "t", "key", "value"]);
  const row_str = JSON.stringify(row_data, null, 4);
  el.textContent = row_str;
}

export function update_stream_time_text(stream_time_id, stream_time) {
  const el = document.getElementById(stream_time_id).lastElementChild;
  el.textContent = stream_time || "-";
}
