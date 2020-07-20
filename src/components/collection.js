export function build_collection_data(config, styles, computed) {
  const { name, partitions } = config;
  const { svg_target } = styles;
  const { coll_padding_top, coll_margin_bottom, coll_label_margin_bottom } = styles;
  const { part_height, part_margin_bottom } = styles;
  const { midpoint_x } = computed;

  let top_y = computed.top_y + coll_padding_top;

  const container = `coll-${name}`;
  const coll_result = { container: container };
  const partitions_result = [];

  const label_computed = { top_y: top_y, midpoint_x: midpoint_x, container: container };
  const label_data = build_coll_label_data(name, styles, label_computed);

  const { coll_label_data, bottom_y } = label_data;
  top_y = bottom_y + coll_label_margin_bottom;

  for (const [partition, rows] of Object.entries(partitions)) {
    const part_computed = {
      part: partition,
      top_y: top_y,
      midpoint_x: midpoint_x,
      container: container
    };

    const part_data = build_partition_data(name, rows, styles, part_computed);
    partitions_result.push(part_data);
    top_y += (part_height + part_margin_bottom);
  }

  return {
    data: {
      kind: "collection",
      container: container,
      target: svg_target,
      label: coll_label_data,
      partitions: partitions_result,
    },
    state: {
      bottom_y: top_y += coll_margin_bottom
    }
  };
}

function render_coll_label(data) {
  const { container, label, tip, bar, left_foot, right_foot } = data;

  const html =`
<g class="coll-label">
    <text x="${label.x}" y="${label.y}" text-anchor="middle" class="code">${label.coll}</text>
    <line x1="${tip.x1}" y1="${tip.y1}" x2="${tip.x2}" y2="${tip.y2}" class="coll-connector"></line>
    <line x1="${bar.x1}" y1="${bar.y1}" x2="${bar.x2}" y2="${bar.y2}" class="coll-connector"></line>
    <line x1="${left_foot.x1}" y1="${left_foot.y1}" x2="${left_foot.x2}" y2="${left_foot.y2}" class="coll-connector"></line>
    <line x1="${right_foot.x1}" y1="${right_foot.y1}" x2="${right_foot.x2}" y2="${right_foot.y2}" class="coll-connector"></line>
</g>`;

  $("." + container).append(html);
}

function render_coll_container(data) {
  const { target, container } = data;
  $("." + target).append(`<g class="coll-container ${container}"></g>`);
}

export function render_collection(data) {
  render_coll_container(data);
  render_coll_label(data.label);

  for (const partition of data.partitions) {
    render_partition(partition);
  }
}
