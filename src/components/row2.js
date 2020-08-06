import { uuidv4, select_keys } from './../util';

export function build_data(config, styles, computed) {
  return {
    kind: "row",
    id: uuidv4(),
    rendering: {
      width: ?,
      height: ?,
      x: ?,
      y: ?,
      fill: ?
    },
    vars: {
      record: {
        collection: ?,
        partition: ?,
        offset: ?,
        t: ?,
        key: ?,
        value: ?
      },
      source_id: ?
    },
    refs: {

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
  rect.setAttribute("data-collection", vars.record.collection);
  rect.setAttribute("data-partition", vars.record.partition);
  rect.setAttribute("data-offset", vars.record.offset);

  const title = document.createElement("title");
  const record_ks = ["collection", "partition", "offset", "t", "key", "value"];
  const row_data = select_keys(vars.record, record_ks);
  title.innerText = JSON.stringify(row_data, null, 4);

  rect.appendChild(title);

  return rect;
}
