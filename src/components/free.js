import { uuidv4, create_svg_el } from './../util';

export function build_data(config, styles, computed) {
  return {
    kind: "free",
    id: uuidv4(),
    rendering: {}
  };
}

export function render(data) {
  const { id } = data;

  const g = create_svg_el("g");
  g.id = id;
  g.classList.add("free-objects");

  return g;
}
