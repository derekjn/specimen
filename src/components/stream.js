import * as p from './partition2';
import * as sl from './stream-label';
import { uuidv4 } from './../util';

export function build_data(config, styles, computed) {
  const { name, partitions } = config;
  const { coll_padding_top, coll_margin_bottom, coll_label_margin_bottom } = styles;
  const { part_height, part_margin_bottom } = styles;
  const { midpoint_x } = computed;

  let top_y = computed.top_y + coll_padding_top;

  const label_data = sl.build_data({ name }, styles, {
    top_y: top_y,
    midpoint_x: midpoint_x
  });
  top_y = label_data.refs.bottom_y + coll_label_margin_bottom;

  let partitions_data = [];
  for (const [partition, rows] of Object.entries(partitions)) {
    const config = {
      partition: partition,
      rows: rows
    };

    const part_data = p.build_data(config, styles, {
      part: partition,
      top_y: top_y,
      midpoint_x: midpoint_x
    });
    partitions_data.push(part_data);
    top_y += (part_height + part_margin_bottom);
  }

  return {
    kind: "stream",
    id: uuidv4(),
    name: name,
    refs: {
      top_y: top_y,
      bottom_y: top_y += coll_margin_bottom
    },
    children: {
      label: label_data,
      partitions: partitions_data
    }
  };
}

export function render(data) {
  const { id, rendering, children } = data;
  const { label, partitions } = children;

  const g = document.createElement("g");
  g.id = id;
  g.classList.add("stream-container");

  const d_label = sl.render(label);
  const d_partitions = partitions.map(partition => p.render(partition));

  g.appendChild(d_label);
  d_partitions.forEach(partition => g.appendChild(partition));

  return g;
}
