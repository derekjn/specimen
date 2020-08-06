import { uuidv4 } from './../util';

export function build_data(config, styles, computed) {
  return {
    kind: "consumer_marker",
    id: uuidv4(),
    rendering: {
      x: ?,
      arrow_y: ?,
      text_y: ?
    },
    vars: {
      collection: ?,
      partition: ?,
      pq_name: ?,
      arrow: "↓"
    },
    refs: {
      top_y: ?
    }
  };
}

export function render(data) {
  const { id, vars, rendering } = data;

  const g = document.createElement("g");
  g.id = id;
  g.setAttribute("data-collection", vars.collection);
  g.setAttribute("data-partition", vars.partition);

  const arrow_text = document.createElement("text");
  arrow_text.setAttribute("x", rendering.x);
  arrow_text.setAttribute("y", rendering.arrow_y);
  arrow_text.classList.add("code");
  arrow_text.innerText = vars.arrow;

  const consumer_text = document.createElement("text");
  consumer_text.setAttribute("x", rendering.x);
  consumer_text.setAttribute("y", rendering.text_y);
  consumer_text.setAttribute("text-anchor", "middle");
  consumer_text.classList.add("code");

  g.appendChild(consumer_text);
  g.appendChild(arrow_text);

  return g;
}
