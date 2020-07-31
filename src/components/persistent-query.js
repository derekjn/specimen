import $ from 'jquery';

export function build_persistent_query_data(config, styles, computed) {
  const { name, query_text, style: pq_style } = config;
  
  const { svg_target } = styles;
  const { pq_width, pq_height, pq_margin_top, pq_bracket_len } = styles;
  const { pq_label_margin_left, pq_label_margin_bottom } = styles;
  const { top_y, midpoint_x } = computed;

  const this_top_y = top_y + pq_margin_top;
  const bottom_y = this_top_y + pq_height;
  const left_x = midpoint_x - (pq_width / 2);
  const right_x = midpoint_x + (pq_width / 2);
  const line_bottom_y = this_top_y - 5;
  const b_len = pq_bracket_len;

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
      midpoint_y: bottom_y - (pq_height / 2),
      midpoint_x,
      bottom_y,
      source_partitions: computed.source_partitions,
    },
    state: {
      bottom_y: bottom_y
    }
  };
}

export function render_persistent_query(data) {
  const { line, brackets, label, target, midpoint_x, bottom_y, source_partitions } = data;
  const { tl, tr, bl, br } = brackets;

  const offsetsLabelsOffsetY = bottom_y + 20;
  
  const html = `
<g class="persistent-query-container">
    <line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" class="pq-connector"></line>
    
    <path d="M ${tl.x},${tl.y} h ${tl.h} v ${tl.v}" class="pq"></path>
    <path d="M ${tr.x},${tr.y} h ${tr.h} v ${tr.v}" class="pq"></path>
    <path d="M ${bl.x},${bl.y} v ${bl.v} h ${bl.h}" class="pq"></path>
    <path d="M ${br.x},${br.y} v ${br.v} h ${br.h}" class="pq"></path>

    <text x="${label.x}" y ="${label.y}" class="code">${label.name}</text>
    <g class="offsets-container"></g>
</g>`;

  console.log(source_partitions, label.name);
  
  $("." + target).append(html);

  const {offsets, y} = Object.entries(source_partitions)
        .flatMap(([streamName, partitions]) => partitions.map((p)=>([streamName, p])))
        .reduce(({offsets}, [streamName, name], i) => {
          const y = (bottom_y + 25) + i*15;
    offsets.push(`<text data-stream="${streamName}" data-partition="${name}" x="${bl.x}" y="${y}" class="code pq-${label.name}">${streamName}/${name}: <tspan>0</tspan></text>`);

    return {y, offsets}
  }, {y: 0, offsets:[]});

  //const realBottom = y + offsetsLabelsOffsetY;
  
  $(`.${target} .offsets-container`).append(offsets.join());
  
}
