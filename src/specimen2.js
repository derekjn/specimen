import * as stream from './components/stream';
import * as pq from './components/persistent-query2';
import * as controls from './components/controls';
import * as svg from './components/svg';
import * as qt from './components/query-text';
import * as component from './component';
import * as graphlib from 'graphlib';

import { vertically_center_layout } from "./vertical";
import { styles } from './styles';
import { uuidv4, inverse_map } from './util';

let data_fns = {
  "stream": stream.build_data,
  "persistent_query": pq.build_data
};

let rendering_fns = {
  "stream": stream.render,
  "persistent_query": pq.render,
}

function add_metadata(component, styles) {
  const { row_default_fill } = styles;
  
  switch(component.kind) {
  case "stream":
    Object.entries(component.partitions).forEach(([id, partition]) => {
      partition.forEach((row, i) => {
        row.record = {
          stream: component.name,
          partition: id,
          offset: i,
          t: row.t,
          key: row.key,
          value: row.value
        };

        row.source_id = uuidv4();
        row.style = { ...{ fill: row_default_fill }, ...row.style };
      });
    });

    return component;
  default:
    return component;
  }
}

export function Specimen(container, styles) {
  this._container = container;
  this._styles = styles;
  this._graph = new graphlib.Graph();
}

Specimen.prototype.add_root = function(node) {
  this._graph.setNode(node.name, add_metadata(node, this._styles));
  return this;
}

Specimen.prototype.add_child = function(parents, node) {
  this._graph.setNode(node.name, add_metadata(node, this._styles));

  parents.forEach(parent => {
    this._graph.setEdge(parent, node.name);
  });

  return this;
}

Specimen.prototype.get_node = function(name) {
  return this._graph.node(name);
}

Specimen.prototype.node_kinds = function() {
  const nodes = this._graph.nodes();
  const vals = nodes.map(node => {
    return this._graph.node(node);
  });
  
  return vals.reduce((all, node) => {
    let group = all[node.kind] || {};
    group[node.name] = node;
    all[node.kind] = group;

    return all;
  }, {});
}

Specimen.prototype.source_collections = function() {
  return this._graph.sources();
}

Specimen.prototype.sink_collections = function() {
  return this._graph.sinks();
}

Specimen.prototype.parents = function(name) {
  return this._graph.predecessors(name);
}

Specimen.prototype.children = function(name) {
  return this._graph.successors(name);
}

Specimen.prototype.layout_buckets = function() {
  let index = {};
  const seq = graphlib.alg.topsort(this._graph);

  seq.forEach(x => {
    const parents = this._graph.predecessors(x);

    if (parents.length == 0) {
      index[x] = 0;
    } else {
      const parent_indices = parents.reduce((o, k) => {
        o[k] = index[k];
        return o;
      }, {});

      const max_parent = Math.max(...Object.values(parent_indices));

      index[x] = max_parent + 1;
    }
  });

  return inverse_map(index);
}

Specimen.prototype.horizontal_layout = function() {
  const { svg_width } = this._styles;

  const buckets = this.layout_buckets();
  const n = Object.keys(buckets).length;
  const column_width = (svg_width / n);

  const layout = Object.entries(buckets).reduce((all, pair) => {
    const [i, names] = pair;
    const midpoint_x = (i * column_width) + (column_width / 2);

    let result = []
    let top_y = 0;

    names.sort().forEach(name => {
      const node = this._graph.node(name);
      const computed = { top_y: top_y, midpoint_x: midpoint_x };

      if (node.kind == "persistent_query") {
        const source_partitions = this.parents(node.name).reduce((acc, parent) => {
          const node = this.get_node(parent);
          acc[parent] = Object.keys(node.partitions);          
          return acc;
        }, {});

        node.source_partitions = source_partitions;
      } 

      const data_fn = data_fns[node.kind];
      const data = data_fn(node, this._styles, computed);

      data.name = name;
      top_y = data.refs.bottom_y;
      result.push(data)
    });

    all.push(result);
    return all;
  }, []);

  return vertically_center_layout(layout).flatMap(xs => xs);
}

Specimen.prototype.render = function() {
  const { svg_width } = this._styles;

  const layout = this.horizontal_layout();
  
  const svg_data = svg.build_data({}, this._styles, {});
  const svg_el = svg.render(svg_data);

  const controls_data = controls.build_data({}, this._styles, {});
  const controls_el = controls.render(controls_data);

  layout.forEach(data => {
    const fn = rendering_fns[data.kind];
    const element = fn(data);
    svg_el.appendChild(element);
  });

//  const by_id = component.pack(layout[0])

  const target = document.querySelector(this._container);
  target.appendChild(controls_el);
  target.appendChild(svg_el);

  qt.render(layout, styles, { target: svg_el });
}
