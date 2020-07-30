import { Specimen } from '../../../src/index';
import { styles } from '../../../src/styles';

function example_5() {
  const my_styles = {
    ...styles,
    ...{
      svg_width: 1200,
      svg_height: 500,

      pq_width: 150,
      pq_height: 150,
      pq_margin_top: 50,
      pq_bracket_len: 25,
      pq_label_margin_left: 0,
      pq_label_margin_bottom: 10,

      part_width: 200,
      part_height: 50,
      part_bracket_len: 10,
      part_id_margin_left: -15,
      part_id_margin_top: 8,

      row_width: 15,
      row_height: 15,
      row_margin_left: 8,
      row_offset_right: 10,
    }
  };

  const s = new Specimen(my_styles);

  s.add_root({
    name: "s1",
    kind: "collection",
    partitions: {
      0: [
        { value: 40, t: 2 },
        { value: 41, t: 4 },
        { value: 42, t: 7 }
      ],
      1: [
        { value: 42, t: 1 },
        { value: 43, t: 3 },
        { value: 41, t: 5 },
        { value: 40, t: 6 }
      ],
      2: [
        { value: 41, t: 2 },
        { value: 42, t: 4 },
        { value: 43, t: 6 }
      ],
      3: [
        { value: 43, t: 1 },
        { value: 40, t: 3 },
        { value: 40, t: 4 },
        { value: 42, t: 5 },
        { value: 41, t: 5 }
      ]
    }
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    query_text: [
      "CREATE STREAM s2 AS",
      "  SELECT col1, FLOOR(col2) AS f",
      "  FROM s1",
      "  EMIT CHANGES;"
    ],
    style: {
      fill: function(old_row, new_row) {
        const flavors = [
          "#38CCED",
          "#0074A2",
          "#829494",
          "#D8365D"
        ];
        return flavors[old_row.value % flavors.length];
      }
    }
  });

  s.add_child(["pq1"], {
    name: "s2",
    kind: "collection",
    partitions: {
      0: [],
      1: [],
      2: [],
      3: []
    }
  });

  s.add_child(["s2"], {
    name: "pq2",
    kind: "persistent_query",
    into: "s3",
    partition_by: function(context, old_row, new_row) {
      return old_row.value % context.partitions;
    },
    query_text: [
      "CREATE STREAM s3 AS",
      "  SELECT *",
      "  FROM s2",
      "  PARTITION BY f",
      "  EMIT CHANGES;"
    ]
  });

  s.add_child(["pq2"], {
    name: "s3",
    kind: "collection",
    partitions: {
      0: [],
      1: [],
      2: [],
      3: []
    }
  });
  
  const container = ".example-5";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  s.animate(layout, container);
}

example_5();



          

// var xs = [
//   "CREATE STREAM s2 AS",
//   "  SELECT * FROM s1",
//   "  PARTITION BY x",
//   "  EMIT CHANGES;"
// ];

// var ys = [
//   "CREATE STREAM FOO AS",
//   "  SELECT SSSS",
//   "  BLAH",
//   "  EMIT XXXXXXX",
//   "  LIMIT 50;"
// ];



// function add_code(code) {
//   const new_code = document.createElement("code");
//   new_code.innerText = code.join("\n");

//   const new_pre = document.createElement("pre");
//   new_pre.style.position = "absolute";
//   new_pre.style.bottom = "0";
//   new_pre.style.left = "0";
//   new_pre.style.right = "0";

//   new_pre.style.marginLeft = "auto";
//   new_pre.style.marginRight = "auto";
//   new_pre.appendChild(new_code);

//   return {
//     pre: new_pre,
//     code: new_code
//   };
// }

// function make_parent_container(a, b) {
//   const new_div = document.createElement("div");
//   new_div.style.position = "relative";

//   new_div.appendChild(a);
//   new_div.appendChild(b);

//   return new_div;
// }

// function set_pre_width(pre, code) {
//   pre.style.width = `${code.offsetWidth}px`;
// }

// function set_parent_height(parent, a, b) {
//   const height = Math.max(a.offsetHeight, b.offsetHeight);
//   parent.style.height = `${height}px`;
// }

// const { pre: a, code: a_c } = add_code(xs);
// const { pre: b, code: b_c } = add_code(ys);

// parent = make_parent_container(a, b);
// const target = document.getElementById("my-target");
// target.appendChild(parent);

// set_pre_width(a, a_c);
// set_pre_width(b, b_c);
// set_parent_height(parent, a, b);
