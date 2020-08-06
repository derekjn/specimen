import { uuidv4 } from './../util';

export function build_data(config, styles, computed) {
  return {
    kind: "partition",
    id: uuidv4(),
    rendering: {
      partition_label: {
      },
      brackets: {
      }
    },
    vars: {
      partition_id: ?
    },
    refs: {
      midpoint_y: ?,
      right_x: ?
    },
    children: {
      rows: [ ? ]
    }
  };
}

export function render(config, styles, computed) {
  const { id, vars, rendering } = data;
  const { partition_label, brackets } = rendering;
  const { tl, tr, bl, br } = brackets;

  const g = document.createElement("g");
  g.id = id;
  g.classList.add("partition-container");

  const text = document.createElement("text");
  text.setAttribute("x", partition_label.x);
  text.setAttribute("y", partition_label.y);
  text.classList.add("code");
  text.innerText = vars.partition_id;

  const d_tl = document.createElement("path");
  d_tl.setAttribute("d", "M ${tl.x},${tl.y} h ${tl.h} v ${tl.v}");
  d_tl.classList.add("partition");

  const d_tr = document.createElement("path");
  d_tr.setAttribute("d", "M ${tr.x},${tr.y} h ${tr.h} v ${tr.v}");
  d_tr.classList.add("partition");

  const d_bl = document.createElement("path");
  d_bl.setAttribute("d", "M ${bl.x},${bl.y} v ${bl.v} h ${bl.h}");
  d_bl.classList.add("partition");

  const d_br = document.createElement("path");
  d_br.setAttribute("d", "M ${br.x},${br.y} v ${br.v} h ${br.h}");
  d_br.classList.add("partition");

  g.appendChild(text);
  g.appendChild(d_tl);
  g.appendChild(d_tr);
  g.appendChild(d_bl);
  g.appendChild(d_br);

  return g;
}
