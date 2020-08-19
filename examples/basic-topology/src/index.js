import { Specimen } from '../../../src/index';

import hljs from 'highlight.js/lib/core';
import ksql from '../../../src/ksql-highlightjs';
import hljs_js from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('sql', ksql);
hljs.registerLanguage('javascript', hljs_js);
hljs.initHighlightingOnLoad();

function rekeying(container) {
  const styles = {
    svg_width: 1200,
    svg_height: 400,

    pq_width: 150,
    pq_height: 150,
    pq_margin_top: 50,
    pq_bracket_len: 25,
    pq_label_margin_left: 0,
    pq_label_margin_bottom: 10,

    part_width: 200,
    part_height: 50,
    part_bracket_len: 10,
    part_margin_bottom: 20,
    part_id_margin_left: -15,
    part_id_margin_top: 8,

    row_width: 15,
    row_height: 15,
    row_margin_left: 8,
    row_offset_right: 10,

    ms_px: 3
  };

  const s = new Specimen(container, styles);

  s.add_root({
    name: "s1",
    kind: "stream",
    partitions: [
      [
        { value: 40, t: 22 },
        { value: 41, t: 45 },
        { value: 42, t: 73 }
      ],
      [
        { value: 42, t: 11 },
        { value: 43, t: 38 },
        { value: 41, t: 57 },
        { value: 40, t: 60 }
      ],
      [
        { value: 41, t: 24 },
        { value: 42, t: 43 },
        { value: 43, t: 67 }
      ],
      [
        { value: 43, t: 19 },
        { value: 40, t: 38 },
        { value: 40, t: 42 },
        { value: 42, t: 55 },
        { value: 41, t: 53 }
      ]
    ]
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    query_text: [
      "CREATE STREAM s2 AS",
      "  SELECT col1, FLOOR(col2) AS f",
      "  FROM s1",
      "  WHERE col3 != 'foo'",
      "  EMIT CHANGES;"
    ],
    style: {
      fill: function(before_row, after_row) {
        const flavors = [
          "#38CCED",
          "#0074A2",
          "#829494",
          "#D8365D"
        ];
        return flavors[before_row.value % flavors.length];
      }
    }
  });

  s.add_child(["pq1"], {
    name: "s2",
    kind: "stream",
    partitions: [
      [],
      [],
      [],
      []
    ]
  });

  s.add_child(["s2"], {
    name: "pq2",
    kind: "persistent_query",
    into: "s3",
    query_text: [
      "CREATE STREAM s2 AS",
      "  SELECT col1, FLOOR(col2) AS f",
      "  FROM s1",
      "  WHERE col3 != 'foo'",
      "  EMIT CHANGES;"
    ],
    partition_by: function(context, before_row, after_row) {
      return before_row.value;
    }
  });  

  s.add_child(["pq2"], {
    name: "s3",
    kind: "stream",
    partitions: [
      [],
      [],
      [],
      []
    ]
  });

  s.render();
}

function stream(container) {
  const styles = {
    svg_width: 1200,
    svg_height: 350,

    pq_width: 150,
    pq_height: 150,
    pq_margin_top: 50,
    pq_bracket_len: 25,
    pq_label_margin_left: 0,
    pq_label_margin_bottom: 10,

    part_width: 200,
    part_height: 50,
    part_bracket_len: 10,
    part_margin_bottom: 20,
    part_id_margin_left: -15,
    part_id_margin_top: 8,

    row_width: 15,
    row_height: 15,
    row_margin_left: 8,
    row_offset_right: 10,

    render_controls: false
  };

  const s = new Specimen(container, styles);

  s.add_root({
    name: "s1",
    kind: "stream",
    partitions: [
      [
        { value: 40, t: 22 },
        { value: 41, t: 45 },
        { value: 42, t: 73 }
      ],
      [
        { value: 42, t: 11 },
        { value: 43, t: 38 },
        { value: 41, t: 57 },
        { value: 40, t: 60 }
      ],
      [
        { value: 41, t: 24 },
        { value: 42, t: 43 },
        { value: 43, t: 67 }
      ],
      [
        { value: 43, t: 19 },
        { value: 40, t: 38 },
        { value: 40, t: 42 },
        { value: 42, t: 55 },
        { value: 41, t: 53 }
      ]
    ]
  });

  s.render();
}

function transforming(container) {
  const styles = {
    svg_width: 1200,
    svg_height: 350,

    pq_width: 150,
    pq_height: 150,
    pq_margin_top: 50,
    pq_bracket_len: 25,
    pq_label_margin_left: 0,
    pq_label_margin_bottom: 10,

    part_width: 200,
    part_height: 50,
    part_bracket_len: 10,
    part_margin_bottom: 20,
    part_id_margin_left: -15,
    part_id_margin_top: 8,

    row_width: 15,
    row_height: 15,
    row_margin_left: 8,
    row_offset_right: 10,

    ms_px: 3
  };

  const s = new Specimen(container, styles);

  s.add_root({
    name: "s1",
    kind: "stream",
    partitions: [
      [
        { value: 40, t: 22 },
        { value: 41, t: 45 },
        { value: 42, t: 73 }
      ],
      [
        { value: 42, t: 11 },
        { value: 43, t: 38 },
        { value: 41, t: 57 },
        { value: 40, t: 60 }
      ],
      [
        { value: 41, t: 24 },
        { value: 42, t: 43 },
        { value: 43, t: 67 }
      ],
      [
        { value: 43, t: 19 },
        { value: 40, t: 38 },
        { value: 40, t: 42 },
        { value: 42, t: 55 },
        { value: 41, t: 53 }
      ]
    ]
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    query_text: [
      "CREATE STREAM s2 AS",
      "  SELECT col1, FLOOR(col2) AS f",
      "  FROM s1",
      "  WHERE col3 != 'foo'",
      "  EMIT CHANGES;"
    ]
  });

  s.add_child(["pq1"], {
    name: "s2",
    kind: "stream",
    partitions: [
      [],
      [],
      [],
      []
    ]
  });

  s.render();
}

function coloring(container) {
  const styles = {
    svg_width: 1200,
    svg_height: 350,

    pq_width: 150,
    pq_height: 150,
    pq_margin_top: 50,
    pq_bracket_len: 25,
    pq_label_margin_left: 0,
    pq_label_margin_bottom: 10,

    part_width: 200,
    part_height: 50,
    part_bracket_len: 10,
    part_margin_bottom: 20,
    part_id_margin_left: -15,
    part_id_margin_top: 8,

    row_width: 15,
    row_height: 15,
    row_margin_left: 8,
    row_offset_right: 10,

    ms_px: 3
  };

  const s = new Specimen(container, styles);

  s.add_root({
    name: "s1",
    kind: "stream",
    partitions: [
      [
        { value: 40, t: 22 },
        { value: 41, t: 45 },
        { value: 42, t: 73 }
      ],
      [
        { value: 42, t: 11 },
        { value: 43, t: 38 },
        { value: 41, t: 57 },
        { value: 40, t: 60 }
      ],
      [
        { value: 41, t: 24 },
        { value: 42, t: 43 },
        { value: 43, t: 67 }
      ],
      [
        { value: 43, t: 19 },
        { value: 40, t: 38 },
        { value: 40, t: 42 },
        { value: 42, t: 55 },
        { value: 41, t: 53 }
      ]
    ]
  });

  s.add_child(["s1"], {
    name: "pq1",
    kind: "persistent_query",
    into: "s2",
    query_text: [
      "CREATE STREAM s2 AS",
      "  SELECT col1, FLOOR(col2) AS f",
      "  FROM s1",
      "  WHERE col3 != 'foo'",
      "  EMIT CHANGES;"
    ],
    style: {
      fill: function(before_row, after_row) {
        const flavors = [
          "#38CCED",
          "#0074A2",
          "#829494",
          "#D8365D"
        ];
        return flavors[before_row.value % flavors.length];
      }
    }
  });

  s.add_child(["pq1"], {
    name: "s2",
    kind: "stream",
    partitions: [
      [],
      [],
      [],
      []
    ]
  });

  s.render();
}

rekeying("#rekeying");
stream("#stream");
transforming("#transforming");
coloring("#coloring");
rekeying("#fully-assembled");
