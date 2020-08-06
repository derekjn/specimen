import { uuidv4 } from './../util';
import $ from 'jquery';


{
  data: {
    kind: "persistent_query",
    id: uuid,
    rendering: {
      line: {
      },
      label: {
      },
      brackets: {
      },
      stream_time: {
        kind: "stream_time_clock",
      }
    }
    refs: {
      box: {
        top_left: ?,
        top_right: ?,
        bottom_left: ?,
        bottom_right: ?
      },
      midpoint_x: ?,
      midpoint_y: ?
    },
    vars: {
      query_text: ?
    }
  },
  state: {
  }
}




function build_source_partition_data(config, { left_x, top_y, margin }) {
  const partitions = Object.entries(config).reduce((all, [coll, partitions]) => {
    partitions.forEach(partition => {
      const data = {
        collection: coll,
        partition: partition,
        x: left_x,
        y: top_y
      };

      top_y += margin;
      all.push(data);
    });

    return all;
  }, []);

  return {
    data: {
      source_partitions: partitions
    },
    state: {
      bottom_y: top_y
    }
  };
}

export function build_persistent_query_data(config, styles, computed) {
  const { name, query_text, style: pq_style } = config;
  const { svg_target } = styles;
  const { pq_width, pq_height, pq_margin_top, pq_bracket_len } = styles;
  const { pq_label_margin_left, pq_label_margin_bottom } = styles;
  const { pq_metadata_offset_top, pq_metadata_margin_top } = styles;
  const { top_y, midpoint_x, source_partitions } = computed;

  const this_top_y = top_y + pq_margin_top;
  const box_bottom_y = this_top_y + pq_height;
  const left_x = midpoint_x - (pq_width / 2);
  const right_x = midpoint_x + (pq_width / 2);
  const line_bottom_y = this_top_y - 5;
  const b_len = pq_bracket_len;

  const metadata_top_y = box_bottom_y + pq_metadata_offset_top;
  const sp_computed = {
    left_x: left_x,
    top_y: metadata_top_y,
    margin: pq_metadata_margin_top
  };
  const { data: sp_data, state: sp_state } = build_source_partition_data(source_partitions, sp_computed);

  const stream_time_computed = {
    left_x: left_x,
    top_y: sp_state.bottom_y,
    margin: pq_metadata_margin_top
  };
  const { data: st_data, state: st_state } = build_stream_time_data(stream_time_computed);

  return {
    data: {
      kind: "persistent_query",
      query_text: query_text,
      style: pq_style || {},
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
      source_partitions: {
        partitions: sp_data.source_partitions,
        name: name
      },
      stream_time: st_data,
      target: svg_target,
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
      midpoint_x: midpoint_x,
      midpoint_y: box_bottom_y - (pq_height / 2),
      bottom_y: st_state.bottom_y
    },
    state: {
      bottom_y: st_state.bottom_y
    }
  };
}

function source_partitions_html({ partitions, name }) {
  let html = ``;

  partitions.forEach(data => {
    html += `
<text x="${data.x}" y="${data.y}" class="code collection-${data.collection} partition-${data.partition} pq-${name}">${data.collection}/${data.partition}: <tspan>-</tspan></text>`;
  });

  return html;
}

function stream_time_html({ id, x, y }) {
  return `
<text id="${id}" x="${x}" y="${y}" class="code">Stream time: <tspan>-</tspan></text>
`;
}

export function render_persistent_query(data) {
  const { line, brackets, label, source_partitions, stream_time, target } = data;
  const { tl, tr, bl, br } = brackets;

  const source_partitions_markup = source_partitions_html(source_partitions);
  const stream_time_markup = stream_time_html(stream_time);

  const html = `
<g class="persistent-query-container">
    <line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" class="pq-connector"></line>
    
    <path d="M ${tl.x},${tl.y} h ${tl.h} v ${tl.v}" class="pq"></path>
    <path d="M ${tr.x},${tr.y} h ${tr.h} v ${tr.v}" class="pq"></path>
    <path d="M ${bl.x},${bl.y} v ${bl.v} h ${bl.h}" class="pq"></path>
    <path d="M ${br.x},${br.y} v ${br.v} h ${br.h}" class="pq"></path>

    <text x="${label.x}" y ="${label.y}" class="code">${label.name}</text>
    ${source_partitions_markup}
    ${stream_time_markup}
</g>`;

  $("." + target).append(html);
}
