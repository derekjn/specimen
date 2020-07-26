import { Specimen } from '../../../src/index';
import { styles } from '../../../src/styles';

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
      const flavors = ["#97FF6B", "#FFE56B", "#FF6B7C", "#BF6BFF"];
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

const container = ".animation-container-1";
const layout = s.horizontal_layout(my_styles);
s.render(layout, container);
s.animate(layout, container);
