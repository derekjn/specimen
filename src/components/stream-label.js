import { uuidv4 } from './../util';

export function build_data(config, styles, computed) {
  return {
    kind: "stream_label",
    id: uuidv4(),
    rendering: {
      label: {
      },
      tip: {
      },
      bar: {
      },
      left_foot: {
      },
      right_foot: {
      }
    },
    vars: {
      name: ?
    },
    refs: {
      bottom_y: ?
    }
  };
}

export function render(data) {
  const { vars, rendering } = data;
  const { label, tip, bar, left_foot, right_foot } = rendering;

  const g = document.createElement("g");
  g.classList.add("stream-label");

  const d_label = document.createElement("text");
  d_label.setAttribute("x", label.x);
  d_label.setAttribute("y", label.y);
  d_label.setAttribute("text-anchor", "middle");
  d_label.classList.add("code");
  d_label.innerText = vars.name;

  const d_tip = document.createElement("line");
  d_tip.setAttribute("x1", tip.x1);
  d_tip.setAttribute("y1", tip.y1);
  d_tip.setAttribute("x2", tip.x2);
  d_tip.setAttribute("y2", tip.y2);
  d_label.classList.add("stream-connector");

  const d_bar = document.createElement("line");
  d_bar.setAttribute("x1", bar.x1);
  d_bar.setAttribute("y1", bar.y1);
  d_bar.setAttribute("x2", bar.x2);
  d_bar.setAttribute("y2", bar.y2);
  d_label.classList.add("stream-connector");

  const d_left_foot = document.createElement("line");
  d_left_foot.setAttribute("x1", left_foot.x1);
  d_left_foot.setAttribute("y1", left_foot.y1);
  d_left_foot.setAttribute("x2", left_foot.x2);
  d_left_foot.setAttribute("y2", left_foot.y2);
  d_label.classList.add("stream-connector");

  const d_right_foot = document.createElement("line");
  d_right_foot.setAttribute("x1", right_foot.x1);
  d_right_foot.setAttribute("y1", right_foot.y1);
  d_right_foot.setAttribute("x2", right_foot.x2);
  d_right_foot.setAttribute("y2", right_foot.y2);
  d_label.classList.add("stream-connector");

  g.appendChild(d_label);
  g.appendChild(d_bar);
  g.appendChild(d_left_foot);
  g.appendChild(d_right_foot);

  return g;
}
