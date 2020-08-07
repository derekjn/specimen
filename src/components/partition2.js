import * as r from './row2';
import { uuidv4 } from './../util';

export function build_data(config, styles, computed) {
  const { partition, rows } = config;

  const { part_bracket_len, part_width, part_height, part_id_margin_top, part_id_margin_left } = styles;
  const { row_height, row_width, row_margin_left, row_offset_right } = styles;

  const { top_y, midpoint_x } = computed;

  const b_len = part_bracket_len;

  const left_x = midpoint_x - (part_width / 2);
  const right_x = midpoint_x + (part_width / 2);
  const bottom_y = top_y + part_height;
  const midpoint_y = top_y + (part_height / 2);

  let row_x = right_x - row_offset_right - row_width;
  let rows_data = [];
  rows.forEach(row => {
    rows_data.push(r.build_data(row, styles, {
      left_x: row_x,
      top_y: top_y,
    }));
    row_x -= (row_width + row_margin_left);
  });

  return {
    kind: "partition",
    id: uuidv4(),
    rendering: {
      partition_label: {
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
      }
    },
    vars: {
      partition_id: partition
    },
    refs: {
      midpoint_y: midpoint_y,
      right_x: right_x
    },
    children: {
      rows: rows_data
    }
  };
}

export function render(data, styles, computed) {
  const { id, vars, rendering, children } = data;
  const { partition_label, brackets } = rendering;
  const { tl, tr, bl, br } = brackets;
  const { rows } = children;

  const g = document.createElement("g");
  g.id = id;
  g.classList.add("partition-container");

  const text = document.createElement("text");
  text.setAttribute("x", partition_label.x);
  text.setAttribute("y", partition_label.y);
  text.classList.add("code");
  text.innerText = vars.partition_id;

  const d_tl = document.createElement("path");
  d_tl.setAttribute("d", `M ${tl.x},${tl.y} h ${tl.h} v ${tl.v}`);
  d_tl.classList.add("partition");

  const d_tr = document.createElement("path");
  d_tr.setAttribute("d", `M ${tr.x},${tr.y} h ${tr.h} v ${tr.v}`);
  d_tr.classList.add("partition");

  const d_bl = document.createElement("path");
  d_bl.setAttribute("d", `M ${bl.x},${bl.y} v ${bl.v} h ${bl.h}`);
  d_bl.classList.add("partition");

  const d_br = document.createElement("path");
  d_br.setAttribute("d", `M ${br.x},${br.y} v ${br.v} h ${br.h}`);
  d_br.classList.add("partition");

  const rows_g = document.createElement("g");
  rows_g.classList.add("rows");

  const d_rows = rows.map(row => r.render(row));
  d_rows.forEach(row => rows_g.appendChild(row));

  g.appendChild(text);
  g.appendChild(d_tl);
  g.appendChild(d_tr);
  g.appendChild(d_bl);
  g.appendChild(d_br);
  g.appendChild(rows_g);

  return g;
}
