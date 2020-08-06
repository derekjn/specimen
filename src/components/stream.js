import * as sl from './stream-label';
import { uuidv4 } from './../util';

function build_partitions_data(partitions, top_y, midpoint_x) {
  let result = [];
  
  for (const [partition, rows] of Object.entries(partitions)) {
    const part_computed = {
      part: partition,
      top_y: top_y,
      midpoint_x: midpoint_x,
    };

    const part_data = build_partition_data(name, rows, styles, part_computed);
    partitions_result.push(part_data);
    top_y += (part_height + part_margin_bottom);
  }

  return result;
}

export function build_data(config, styles, computed) {
  const { name, partitions } = config;

  const { midpoint_x } = computed;


  let top_y = computed.top_y + coll_padding_top;
  

  const label_data = build_coll_label_data(name, styles, {
    top_y: top_y,
    midpoint_x: midpoint_x
  });

  
  return {
    kind: "stream",
    id: uuidv4(),
    name: name,
    vars: {
    },
    refs: {
      bottom_y: ?
    },
    children: {
      label: sl.build_data(?, styles, {}),
      partitions: [ ? ]
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
