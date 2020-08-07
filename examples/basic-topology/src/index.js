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
    kind: "stream",
    partitions: {
      0: [
        { value: 40, t: 22 },
        { value: 41, t: 45 },
        { value: 42, t: 73 }
      ],
      1: [
        { value: 42, t: 11 },
        { value: 43, t: 38 },
        { value: 41, t: 57 },
        { value: 40, t: 60 }
      ],
      2: [
        { value: 41, t: 24 },
        { value: 42, t: 43 },
        { value: 43, t: 67 }
      ],
      3: [
        { value: 43, t: 19 },
        { value: 40, t: 38 },
        { value: 40, t: 42 },
        { value: 42, t: 55 },
        { value: 41, t: 53 }
      ]
    }
  });

  // s.add_child(["s1"], {
  //   name: "pq1",
  //   kind: "persistent_query",
  //   into: "s2",
  //   query_text: [
  //     "CREATE STREAM s2 AS",
  //     "  SELECT col1, FLOOR(col2) AS f",
  //     "  FROM s1",
  //     "  WHERE col3 != 'foo'",
  //     "  EMIT CHANGES;"
  //   ],
  //   where: function(context, row) {
  //     return row.value != 41 && row.value != 42;
  //   },
  //   style: {
  //     fill: function(old_row, new_row) {
  //       const flavors = [
  //         "#38CCED",
  //         "#0074A2",
  //         "#829494",
  //         "#D8365D"
  //       ];
  //       return flavors[old_row.value % flavors.length];
  //     }
  //   }
  // });

  // s.add_child(["pq1"], {
  //   name: "s2",
  //   kind: "stream",
  //   partitions: {
  //     0: [],
  //     1: [],
  //     2: [],
  //     3: []
  //   }
  // });


  // s.add_child(["s2"], {
  //   name: "pq2",
  //   kind: "persistent_query",
  //   into: "s3",
  //   partition_by: function(context, old_row, new_row) {
  //     return old_row.value;
  //   },
  //   query_text: [
  //     "CREATE STREAM s3 AS",
  //     "  SELECT *",
  //     "  FROM s2",
  //     "  PARTITION BY f",
  //     "  EMIT CHANGES;"
  //   ]
  // });

  // s.add_child(["pq2"], {
  //   name: "s3",
  //   kind: "collection",
  //   partitions: {
  //     0: [],
  //     1: [],
  //     2: [],
  //     3: []
  //   }
  // });
  
  const container = ".example-5";
  const layout = s.horizontal_layout(my_styles);
  s.render(layout, container);
  // s.animate(layout, container);
}

example_5();
