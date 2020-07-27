import { Specimen } from '../../../src/index';
import { styles } from '../../../src/styles';

function example_1() {
  const my_styles = {
    ...styles,
    ...{
      svg_width: 900,
      svg_height: 500,

      pq_width: 150,
      pq_height: 150,
      pq_margin_top: 50,
      pq_bracket_len: 25,
      pq_label_margin_left: 0,
      pq_label_margin_bottom: 10,

      part_width: 250,
      part_height: 75,
      part_margin_bottom: 20,
      part_bracket_len: 10,
      part_id_margin_left: -15,
      part_id_margin_top: 8,

      row_width: 20,
      row_height: 20,
      row_margin_left: 10,
      row_offset_right: 15,

    }
  };
  const s = new Specimen(my_styles);

  s.add_root({
    name: "s1",
    kind: "collection",
    partitions: {
      0: [
        { value: 40, t: 1 },
        { value: 41, t: 2 },
        { value: 42, t: 3 },
        { value: 30, t: 4 },
        { value: 31, t: 5 },
        { value: 32, t: 6 },
        { value: 33, t: 7 }
      ]
    }
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    style: {
      fill: function(old_row, new_row) {
        return "#38CCED";
      }
    }
  });

  s.add_child(["pq1"], {
    name: "s2",
    kind: "collection",
    partitions: {
      0: []
    }
  });

  const container = ".example-1";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  s.animate(layout, container);
}

function example_2() {
  const my_styles = {
    ...styles,
    ...{
      svg_width: 900,
      svg_height: 500,

      pq_width: 150,
      pq_height: 150,
      pq_margin_top: 50,
      pq_bracket_len: 25,
      pq_label_margin_left: 0,
      pq_label_margin_bottom: 10,

      part_width: 250,
      part_height: 75,
      part_margin_bottom: 20,
      part_bracket_len: 10,
      part_id_margin_left: -15,
      part_id_margin_top: 8,

      row_width: 20,
      row_height: 20,
      row_margin_left: 10,
      row_offset_right: 15,

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
        { value: 30, t: 1 },
        { value: 31, t: 3 },
        { value: 32, t: 5 },
        { value: 33, t: 6 }
      ],
      2: [
        { value: 20, t: 2 },
        { value: 21, t: 4 },
        { value: 22, t: 6 }
      ],
      3: [
        { value: 10, t: 1 },
        { value: 11, t: 3 },
        { value: 12, t: 4 },
        { value: 13, t: 5 },
        { value: 14, t: 5 }
      ]
    }
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
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

  const container = ".example-2";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  s.animate(layout, container);
}

function example_3() {
  const my_styles = {
    ...styles,
    ...{
      svg_width: 900,
      svg_height: 500,

      pq_width: 150,
      pq_height: 150,
      pq_margin_top: 50,
      pq_bracket_len: 25,
      pq_label_margin_left: 0,
      pq_label_margin_bottom: 10,

      part_width: 250,
      part_height: 75,
      part_margin_bottom: 20,
      part_bracket_len: 10,
      part_id_margin_left: -15,
      part_id_margin_top: 8,

      row_width: 20,
      row_height: 20,
      row_margin_left: 10,
      row_offset_right: 15,

    }
  };

  const s = new Specimen(my_styles);

  s.add_root({
    name: "s1",
    kind: "collection",
    partitions: {
      0: [
        { value: 40, t: 2, style: { fill: "#38CCED" } },
        { value: 41, t: 4, style: { fill: "#D8365D" } },
        { value: 42, t: 7, style: { fill: "#0074A2" } }
      ],
      1: [
        { value: 42, t: 1, style: { fill: "#0074A2" } },
        { value: 43, t: 3, style: { fill: "#829494" } },
        { value: 41, t: 5, style: { fill: "#D8365D" } },
        { value: 40, t: 6, style: { fill: "#38CCED" } }
      ],
      2: [
        { value: 41, t: 2, style: { fill: "#D8365D" } },
        { value: 42, t: 4, style: { fill: "#0074A2" } },
        { value: 43, t: 6, style: { fill: "#829494" } }
      ],
      3: [
        { value: 43, t: 1, style: { fill: "#829494" } },
        { value: 40, t: 3, style: { fill: "#38CCED" } },
        { value: 40, t: 4, style: { fill: "#38CCED" } },
        { value: 42, t: 5, style: { fill: "#0074A2" } },
        { value: 41, t: 5, style: { fill: "#D8365D" } }
      ]
    }
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    partition_by: function(context, old_row, new_row) {
      return old_row.value % context.partitions;
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

  const container = ".example-3";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  s.animate(layout, container);
}

function example_4() {
  const my_styles = {
    ...styles,
    ...{
      svg_width: 900,
      svg_height: 800,

      pq_width: 75,
      pq_height: 75,
      pq_margin_top: 50,
      pq_bracket_len: 15,
      pq_label_margin_left: 0,
      pq_label_margin_bottom: 10,

      coll_label_margin_bottom: 50,

      part_width: 200,
      part_height: 50,
      part_margin_bottom: 50,
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
        { value: 42, t: 7 },
        { value: 41, t: 8 },
        { value: 42, t: 9 },
      ],
      1: [
        { value: 42, t: 1 },
        { value: 43, t: 3 },
        { value: 41, t: 5 },
        { value: 40, t: 6 },
        { value: 42, t: 7 },
        { value: 41, t: 8 },
        { value: 42, t: 9 },
      ]
    }
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    style: {
      fill: function(old_row, new_row) {
        return "#38CCED";
      }
    }
  });

  s.add_child(["pq1"], {
    name: "s2",
    kind: "collection",
    partitions: {
      0: [],
      1: [],
    }
  });

  s.add_child(["s1"], {
    name: "pq2",
    kind: "persistent_query",
    into: "s3",
    style: {
      fill: function(old_row, new_row) {
        return "#D8365D";
      }
    }
  });

  s.add_child(["pq2"], {
    name: "s3",
    kind: "collection",
    partitions: {
      0: [],
      1: [],
    }
  });

  const container = ".example-4";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  s.animate(layout, container);
}

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
    }
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

function example_6() {
  const my_styles = { ...styles, ...{ svg_width: 1200, svg_height: 500 } };
  let s = new Specimen(my_styles);

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
        { value: 30, t: 1 },
        { value: 31, t: 3 },
        { value: 32, t: 5 },
        { value: 33, t: 6 }
      ],
      2: [
        { value: 20, t: 2 },
        { value: 21, t: 4 },
        { value: 22, t: 6 }
      ],
      3: [
        { value: 10, t: 1 },
        { value: 11, t: 3 },
        { value: 12, t: 4 },
        { value: 13, t: 5 },
        { value: 14, t: 5 }
      ]
    }
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    partition_by: function(context, row) {
      const { partitions } = context;
      return row.value % partitions;
    },
    style: {
      fill: function(old_row, new_row) {
        const flavors = [
          "#0074A2",
          "#00AFBA",
          "#38CCED",
          "#81CFE2",

          "#829494",
          "#FFC40C",
          "#C5832E",
          "#F26135",

          "#D8365D",
          "#66CC69"
        ];
        return flavors[new_row.value % flavors.length];
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
    into: "s3"
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

  s.add_child(["s3"], {
    name: "pq3",
    kind: "persistent_query",
    into: "s4"
  });

  s.add_child(["pq3"], {
    name: "s4",
    kind: "collection",
    partitions: {
      0: [],
      1: [],
      2: [],
      3: []
    }
  });

  s.add_child(["s4"], {
    name: "pq4",
    kind: "persistent_query",
    into: "s5"
  });

  s.add_child(["pq4"], {
    name: "s5",
    kind: "collection",
    partitions: {
      0: [],
      1: [],
      2: [],
      3: []
    }
  });

  const container = ".example-6";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  s.animate(layout, container);
}

example_1();
example_2();
example_3();
example_4();
example_5();
example_6();
