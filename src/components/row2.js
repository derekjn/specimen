import { uuidv4, select_keys } from './../util';

export function build_data(config, styles, computed) {
  const { record, source_id, style: row_style } = config;

  const { row_width, row_height } = styles;
  const { part_height } = styles;
  const { top_y, left_x } = computed;

  const this_top_y = top_y + (part_height / 2) - (row_height / 2);

  return {
    kind: "row",
    id: uuidv4(),
    rendering: {
      width: row_width,
      height: row_height,
      x: left_x,
      y: this_top_y,
      fill: row_style.fill
    },
    vars: {
      record: {
        stream: record.stream,
        partition: record.partition,
        offset: record.offset,
        t: record.t,
        key: record.key,
        value: record.value
      },
      source_id: source_id
    }
  };
}

export function render(data) {
  const { id, vars, rendering } = data;

  const rect = document.createElement("rect");
  rect.id = id;
  rect.setAttribute("x", rendering.x);
  rect.setAttribute("y", rendering.y);
  rect.setAttribute("width", rendering.width);
  rect.setAttribute("height", rendering.height);
  rect.setAttribute("fill", rendering.fill);
  rect.setAttribute("data-stream", vars.record.stream);
  rect.setAttribute("data-partition", vars.record.partition);
  rect.setAttribute("data-offset", vars.record.offset);

  const title = document.createElement("title");
  const record_ks = ["stream", "partition", "offset", "t", "key", "value"];
  const row_data = select_keys(vars.record, record_ks);
  title.innerText = JSON.stringify(row_data, null, 4);

  rect.appendChild(title);

  return rect;
}
