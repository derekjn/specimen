import { Specimen } from '../../../src/index';
import { styles } from '../../../src/styles';

let s = new Specimen();

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
      { value: 14, t: 5 },
      { value: 15, t: 5 },
    ]
  }
});

s.add_child(["s1"], {
  name: "pq1",
  kind: "persistent_query",
  fn: function(row) {
    return { ...row, ...{ collection: "s2" } };
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

// s.add_child(["s2"], {
//   name: "pq2",
//   kind: "persistent_query",
//   fn: function(row) {
//     return { ...row, ...{ collection: "s3" } };
//   }
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

const container = ".animation-container-1";
const layout = s.horizontal_layout(styles);
s.render(layout, container, styles);
s.animate(layout, container, styles);
