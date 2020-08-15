import { uuidv4, create_svg_el } from './../util';

export function build_data(config, styles, computed) {
  const { partition, pq_name } = config;

  const {
    consumer_m_init_margin_left,
    consumer_m_text_margin_bottom,
    consumer_m_offset_bottom,
  } = styles;

  const { left_x, bottom_y } = computed;

  const x = (left_x + consumer_m_init_margin_left);
  const arrow_y = (bottom_y - consumer_m_offset_bottom);
  const text_y = (arrow_y - consumer_m_text_margin_bottom);

  return {
    kind: "consumer_marker",
    id: uuidv4(),
    rendering: {
      left_x: x,
      arrow_y: arrow_y,
      text_y: text_y
    },
    vars: {
      partition: partition,
      pq_name: pq_name,
      arrow: "↓"
    },
    refs: {
      top_y: text_y
    }
  };
}

export function render(data) {
  const { id, vars, rendering } = data;

  const g = create_svg_el("g");
  g.id = id;
  g.setAttributeNS(null, "data-partition", vars.partition);

  const arrow_text = create_svg_el("text");
  arrow_text.setAttributeNS(null, "x", rendering.left_x);
  arrow_text.setAttributeNS(null, "y", rendering.arrow_y);
  arrow_text.classList.add("code");
  arrow_text.textContent = vars.arrow;

  const consumer_text = create_svg_el("text");
  consumer_text.setAttributeNS(null, "x", rendering.left_x);
  consumer_text.setAttributeNS(null, "y", rendering.text_y);
  consumer_text.setAttributeNS(null, "text-anchor", "middle");
  consumer_text.classList.add("code");
  consumer_text.textContent = vars.pq_name;

  g.appendChild(consumer_text);
  g.appendChild(arrow_text);

  return g;
}
