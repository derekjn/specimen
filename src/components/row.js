export function build_row_data(row, styles, computed) {
  const { row_width, row_height } = styles;
  const { part_height } = styles;
  const { right_x, top_y, row_x } = computed;

  const row_y = top_y + (part_height / 2) - (row_height / 2);

  return {
    width: row_width,
    height: row_height,
    x: row_x,
    y: row_y
  };
}

export function build_rows_data(rows, styles, computed) {
  const { row_width, row_margin_left, row_offset_right } = styles;
  const { right_x, top_y } = computed;
  
  const row_x = right_x - row_offset_right - row_width;
  
  const { result } = rows.reduce((all, row) => {
    const row_computed = { right_x: right_x, top_y: top_y, row_x: all.row_x };
    all.result.push(build_row_data(row, styles, row_computed));
    all.row_x -= (row_width + row_margin_left);

    return all;
  }, { result: [], row_x: row_x });

  return result;
}

export function build_dynamic_container_data(styles) {
  const { svg_target, dynamic_target } = styles;

  return {
    container: svg_target,
    dynamic_target: dynamic_target
  };
}

export function build_dynamic_row_data(row, styles, computed) {
  const { id, collection, partition, offset } = row;

  const { dynamic_target } = styles;
  const { part_height } = styles;
  const { row_width, row_height } = styles;
  const { d_row_margin_left } = styles;

  const { right_x, top_y } = computed;

  const row_x = right_x + d_row_margin_left;
  const row_y = top_y + (part_height / 2) - (row_height / 2);

  return {
    kind: "dynamic_row",
    container: dynamic_target,
    width: row_width,
    height: row_height,
    x: row_x,
    y: row_y,
    id: id,
    collection: collection,
    partition: partition,
    offset: offset
  };
}
