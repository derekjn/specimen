import { uuidv4, create_svg_el } from './../util';

export function build_data(config, styles, computed) {
  const { left_x, top_y, bottom_margin } = computed;
  const bottom_y = top_y + bottom_margin;

  return {
    kind: "stream_time",
    id: uuidv4(),
    rendering: {
      x: left_x,
      y: top_y,
      subtext_id: uuidv4()
    },
    vars: {
      label: "Stream time: ",
      init: "-"
    },
    refs: {
      bottom_y: bottom_y
    }
  };
}

export function render(data) {
  const { id, vars, rendering } = data;

  const text = create_svg_el("text");
  text.id = id;
  text.setAttributeNS(null, "x", rendering.x);
  text.setAttributeNS(null, "y", rendering.y);
  text.classList.add("code");
  text.textContent = vars.label;

  const tspan = create_svg_el("tspan");
  tspan.id = rendering.subtext_id;
  tspan.textContent = vars.init;

  text.appendChild(tspan);

  return text;
}
