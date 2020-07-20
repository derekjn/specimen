export function build_partition_data(coll, rows, styles, computed) {
  const { svg_width } = styles;
  const { part_bracket_len, part_width, part_height, part_id_margin_top, part_id_margin_left } = styles;
  const { row_height } = styles;
  const { part, top_y, midpoint_x, container } = computed;

  const b_len = part_bracket_len;

  const left_x = midpoint_x - (part_width / 2);
  const right_x = midpoint_x + (part_width / 2);
  const bottom_y = top_y + part_height;
  const midpoint_y = top_y + (part_height / 2) - (row_height / 2);

  const rows_data = build_rows_data(rows, styles, { right_x: right_x, top_y: top_y });

  return {
    container: container,
    part: part,
    id: {
      x: left_x + part_id_margin_left,
      y: top_y + part_id_margin_top
    },
    brackets: {
      tl: {
        x: left_x + b_len,
        y: top_y,
        h: -b_len,
        v: b_len
      },
      tr: {
        x: right_x - b_len,
        y: top_y,
        h: b_len,
        v: b_len
      },
      bl: {
        x: left_x,
        y: bottom_y - b_len,
        v: b_len,
        h: b_len
      },
      br: {
        x: right_x,
        y: bottom_y - b_len,
        v: b_len,
        h: -b_len
      }
    },
    midpoint_y: midpoint_y,
    right_x: right_x,
    rows: rows_data
  };
}

export function render_partition(data) {
  const { container, id, brackets, part, rows } = data;
  const { tl, tr, bl, br } = brackets;

  const rows_html = render_rows(rows);

  const html = `
<g class="partition-container">
    <text x="${id.x}" y="${id.y}" class="code">${part}</text>

    <path d="M ${tl.x},${tl.y} h ${tl.h} v ${tl.v}" class="partition"></path>        
    <path d="M ${tr.x},${tr.y} h ${tr.h} v ${tr.v}" class="partition"></path>
    <path d="M ${bl.x},${bl.y} v ${bl.v} h ${bl.h}" class="partition"></path>        
    <path d="M ${br.x},${br.y} v ${br.v} h ${br.h}" class="partition"></path>

    ${rows_html}
</g>
`;

  $("." + container).append(html);
}
