import { uuidv4 } from './../util';
import * as st from './stream-time';

function build_source_partitions_data(arr, computed) {
  const { left_x, top_y, margin } = computed;

  return Object.entries(arr).reduce((all, [coll, partitions]) => {
    partitions.forEach(partition => {
      const this_top_y = top_y;
      top_y += margin;
      const this_bottom_y = top_y;

      const data = {
        collection: coll,
        partition: partition,
        x: left_x,
        top_y: this_top_y,
        bottom_y: this_bottom_y
      };

      all.push(data);
    });

    return all;
  }, []);
}

export function build_data(config, styles, computed) {
  const { name, source_partitions, query_text, style: pq_style } = config;

  const { pq_width, pq_height, pq_margin_top, pq_bracket_len } = styles;
  const { pq_label_margin_left, pq_label_margin_bottom } = styles;
  const { pq_metadata_offset_top, pq_metadata_margin_top } = styles;

  const { top_y, midpoint_x } = computed;

  const this_top_y = top_y + pq_margin_top;
  const box_bottom_y = this_top_y + pq_height;
  const left_x = midpoint_x - (pq_width / 2);
  const right_x = midpoint_x + (pq_width / 2);
  const line_bottom_y = this_top_y - 5;
  const b_len = pq_bracket_len;

  const source_partitions_data = build_source_partitions_data(source_partitions, {
    left_x: left_x,
    top_y: metadata_top_y,
    margin: pq_metadata_margin_top
  });

  const stream_time_data = st.build_data({
    left_x: left_x,
    top_y: source_partitions_data.slice(-1).refs.bottom_y,
    bottom_margin: pq_metadata_margin_top
  });

  return {
    kind: "persistent_query",
    id: uuidv4(),
    name: name
    rendering: {
      line: {
        x1: midpoint_x,
        y1: 0,
        x2: midpoint_x,
        y2: line_bottom_y
      },
      label: {
        name: name,
        x: left_x + pq_label_margin_left,
        y: this_top_y - pq_label_margin_bottom
      },
      brackets: {
        tl: {
          x: left_x + b_len,
          y: this_top_y,
          h: -b_len,
          v: b_len
        },
        tr: {
          x: right_x - b_len,
          y: this_top_y,
          h: b_len,
          v: b_len
        },
        bl: {
          x: left_x,
          y: box_bottom_y - b_len,
          v: b_len,
          h: b_len
        },
        br: {
          x: right_x,
          y: box_bottom_y - b_len,
          v: b_len,
          h: -b_len
        }
      },
      style: pq_style || {},
    },
    vars: {
      query_text: query_text
    },
    children: {
      stream_time: stream_time_data,
      source_partitions: source_partitions_data
    },
    refs: {
      midpoint_x: midpoint_x,
      midpoint_y: box_bottom_y - (pq_height / 2),
      bottom_y: stream_time_data.refs.bottom_y
    }
  }
}

export function render(data) {
  const { id, name, vars, rendering, children } = data;
  const { line, label, brackets } = rendering;
  const { tl, tr, bl, br } = brackets;
  const { stream_time, source_partitions } = children;

  const g = document.createElement("g");
  g.id = id;
  g.classList.add("persistent-query-container");

  const d_line = document.createElement("line");
  d_line.setAttribute("x1", line.x1);
  d_line.setAttribute("y1", line.y1);
  d_line.setAttribute("x2", line.x2);
  d_line.setAttribute("y2", line.y2);
  d_line.classList.add("pq-connector");

  const d_tl = document.createElement("path");
  d_tl.setAttribute("d", "M ${tl.x},${tl.y} h ${tl.h} v ${tl.v}");
  d_tl.classList.add("pq");

  const d_tr = document.createElement("path");
  d_tr.setAttribute("d", "M ${tr.x},${tr.y} h ${tr.h} v ${tr.v}");
  d_tr.classList.add("pq");

  const d_bl = document.createElement("path");
  d_bl.setAttribute("d", "M ${bl.x},${bl.y} v ${bl.v} h ${bl.h}");
  d_bl.classList.add("pq");

  const d_br = document.createElement("path");
  d_br.setAttribute("d", "M ${br.x},${br.y} v ${br.v} h ${br.h}");
  d_br.classList.add("pq");

  const d_label = document.createElement("text");
  d_label.setAttribute("x", label.x);
  d_label.setAttribute("y", label.y);
  d_label.classList.add("code");
  d_label.innerText = name;

  const d_stream_time = st.render(stream_time);
  const d_source_partitions = source_partitions.map(s => sp.render(s));
  
  g.appendChild(d_line);
  g.appendChild(d_tl);
  g.appendChild(d_tr);
  g.appendChild(d_bl);
  g.appendChild(d_br);
  g.appendChild(d_label);
  g.appendChild(d_stream_time);
  d_source_partitions.forEach(sp => g.appendChild(sp));

  return g;
}
