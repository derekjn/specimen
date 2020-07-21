function coll_y_top(data) {
  return data.label.label.y;
}

function coll_y_bottom(data) {
  const bl = data.partitions.slice(-1)[0].brackets.bl;
  return (bl.y + bl.v);
}

function persistent_query_y_top(data) {
  return data.line.y1;
}

function persistent_query_y_bottom(data) {
  const bl = data.brackets.bl;
  return (bl.y + bl.v);
}

function rendered_y_top(data) {
  switch(data.kind) {
  case "collection":
    return coll_y_top(data)
  case "persistent_query":
    return persistent_query_y_top(data);
  }
}

function rendered_y_bottom(data) {
  switch(data.kind) {
  case "collection":
    return coll_y_bottom(data)
  case "persistent_query":
    return persistent_query_y_bottom(data);
  }
}

function collection_translate_y(data, height) {
  data.label.label.y += height;

  data.label.tip.y1 += height;
  data.label.tip.y2 += height;

  data.label.bar.y1 += height;
  data.label.bar.y2 += height;

  data.label.left_foot.y1 += height;
  data.label.left_foot.y2 += height;

  data.label.right_foot.y1 += height;
  data.label.right_foot.y2 += height;

  data.partitions = data.partitions.map(partition => {
    partition.id.y += height;

    partition.brackets.tl.y += height;
    partition.brackets.tr.y += height;
    partition.brackets.bl.y += height;
    partition.brackets.br.y += height;

    partition.midpoint_y += height;

    partition.rows = partition.rows.map(row => {
      row.y += height;

      return row;
    });

    return partition;
  });
  
  return data;
}

function persistent_query_translate_y(data, height) {
  data.line.y2 += height;

  data.brackets.tl.y += height;
  data.brackets.tr.y += height;
  data.brackets.bl.y += height;
  data.brackets.br.y += height;

  data.midpoint_y += height;

  data.label.y += height;
  
  return data;
}

function translate_y(data, height) {
  switch(data.kind) {
  case "collection":
    return collection_translate_y(data, height);
  case "persistent_query":
    return persistent_query_translate_y(data, height);
  }
}

export function vertically_center_layout(layout_data) {
  const heights = layout_data.map(components => {
    if (components.length == 1) {
      let data = components[0];

      return rendered_y_bottom(data) - rendered_y_top(data);
    } else {
      let data_1 = components[0];
      let data_2 = components.slice(-1)[0];

      return rendered_y_bottom(data_2) - rendered_y_top(data_1);
    }
  });

  const max_height = Math.max(...heights);

  return heights.map((height, i) => {
    const diff = (max_height - height) / 2;
    const n = layout_data[i].length;
    const each_diff = diff / n;

    return layout_data[i].map(data => {
      return translate_y(data, each_diff);
    });
  });
}
