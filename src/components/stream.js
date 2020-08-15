import * as p from './partition';
import * as sl from './stream-label';
import { uuidv4, create_svg_el } from './../util';

export function build_data(config, styles, computed) {
  const { name, partitions } = config;
  const { coll_padding_top, coll_margin_bottom, coll_label_margin_bottom } = styles;
  const { part_height, part_margin_bottom } = styles;
  const { predecessors, successors, midpoint_x } = computed;

  const absolute_top_y = computed.top_y + coll_padding_top;
  let top_y_slide = absolute_top_y;

  const label_data = sl.build_data({ name }, styles, {
    top_y: top_y_slide,
    midpoint_x: midpoint_x
  });

  top_y_slide = label_data.refs.bottom_y + coll_label_margin_bottom;

  let partitions_data = [];
  for (const [partition, rows] of Object.entries(partitions)) {
    const config = {
      partition: partition,
      rows: rows
    };

    const part_data = p.build_data(config, styles, {
      successors: successors,
      top_y: top_y_slide,
      midpoint_x: midpoint_x
    });
    partitions_data.push(part_data);
    top_y_slide += (part_height + part_margin_bottom);
  }

  const absolute_bottom_y = top_y_slide += coll_margin_bottom;

  return {
    kind: "stream",
    id: uuidv4(),
    name: name,
    refs: {
      top_y: absolute_top_y,
      bottom_y: absolute_bottom_y
    },
    children: {
      label: label_data,
      partitions: partitions_data
    },
    graph: {
      predecessors: predecessors,
      successors: successors
    }
  };
}

export function render(data) {
  const { id, rendering, children } = data;
  const { label, partitions } = children;

  const g = create_svg_el("g");
  g.id = id;
  g.classList.add("stream-container");

  const d_label = sl.render(label);
  const d_partitions = partitions.map(partition => p.render(partition));

  g.appendChild(d_label);
  d_partitions.forEach(partition => g.appendChild(partition));

  return g;
}
