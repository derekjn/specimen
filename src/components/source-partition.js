import { uuidv4 } from './../util';

export function build_data(config, computed) {
  const { collection, partition } = config;
  const { left_x, top_y, bottom_y, bottom_margin } = computed;

  return {
    kind: "source_partition_offset",
    id: uuidv4(),
    rendering: {
      x: left_x,
      y: top_y,
      subtext_id: uuidv4()
    },
    vars: {
      collection: collection,
      partition: partition,
      label: `${collection}/${partition}: `,
      init: "-"
    },
    refs: {
      bottom_y: bottom_y
    }
  };
}

export function render(data) {
  const { id, vars, rendering } = data;

  const text = document.createElement("text");
  text.id = id;
  text.setAttribute("data-collection", vars.collection);
  text.setAttribute("data-partition", vars.partition);
  text.setAttribute("x", rendering.x);
  text.setAttribute("y", rendering.y);
  text.innerText = vars.label;

  const tspan = document.createElement("tspan");
  tspan.id = rendering.subtext_id;
  tspan.innerText = vars.init;

  text.appendChild(tspan);

  return text;
}
