import $ from 'jquery';

function build_consumer_marker_data(consumer, styles, computed) {
  const { name } = consumer;

  const { dynamic_target } = styles;
  const {
    consumer_m_init_margin_left,
    consumer_m_text_margin_bottom,
    consumer_m_offset_bottom,
    consumer_m_margin_bottom
  } = styles;

  const { left_x, top_y } = computed;

  const x = (left_x + consumer_m_init_margin_left);
  const arrow_y = (top_y - consumer_m_offset_bottom);
  const text_y = (arrow_y - consumer_m_text_margin_bottom);

  return {
    data: {
      kind: "consumer_marker",
      name: name,
      container: dynamic_target,
      x: x,
      arrow_y: arrow_y,
      text_y: text_y
    },
    state: {
      top_y: text_y
    }
  };
}

export function render_consumer_marker(data) {
  const { name } = data;
  const { container, x, arrow_y, text_y } = data;

  const html = `
<g class="consumer-${name}">
    <text x="${x}" y="${text_y}" text-anchor="middle" class="code">${name}</text>
    <text x="${x}" y="${arrow_y}" class="code">↓</text>
</g>
`;

  $("." + container).append(html);  
}

export function build_consumer_markers_data(layout_index, consumer_graph, styles) {
  const { consumer_m_margin_bottom } = styles;
  let result = {};

  Object.entries(consumer_graph).forEach(([coll, partitions]) => {
    result[coll] = {};

    Object.entries(partitions).forEach(([partition, pqs]) => {
      const left_x = ((layout_index[coll].partitions[partition]).right_x - (styles.row_offset_right));
      let top_y = (layout_index[coll].partitions[partition].midpoint_y) - (styles.row_height / 2);

      if (pqs.length > 0) {
        result[coll][partition] = {};
      }

      pqs.forEach(pq => {
        const consumer = {
          name: pq
        };

        const computed = { left_x: left_x, top_y: top_y };
        const { data, state } = build_consumer_marker_data(consumer, styles, computed);

        result[coll][partition][pq] = data;
        top_y = state.top_y - consumer_m_margin_bottom;
      });
    });
  });

  return result;
}
