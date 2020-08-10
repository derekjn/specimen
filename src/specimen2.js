import * as stream from "./components/stream";
import * as pq from "./components/persistent-query2";
import * as controls from "./components/controls";
import * as svg from "./components/svg";
import * as qt from "./components/query-text";
import * as f from "./components/free";
import * as ci from "./component-index";
import * as v from "./vertical";
import * as s from "./styles";
import * as rt from "./runtime";
import * as a from "./animate2";
import * as graphlib from "graphlib";

import anime from "animejs/lib/anime.es.js";

import { uuidv4, inverse_map } from "./util";

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
    component.partitions.forEach((partition, partition_id) => {
      partition.forEach((row, offset) => {
        row.record = {
          stream: component.name,
          partition: partition_id,
          offset: offset,
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
  this._styles = { ... s.styles, ...styles };
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
      const predecessors = this._graph.predecessors(name);
      const successors = this._graph.successors(name);

      const computed = {
        predecessors: predecessors,
        successors: successors,
        top_y: top_y,
        midpoint_x: midpoint_x
      };

      if (node.kind == "persistent_query") {
        const source_partitions = this._graph.predecessors(node.name).reduce((acc, parent) => {
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

  return v.vertically_center_layout(layout).flatMap(xs => xs);
}

Specimen.prototype.draw_layout = function(layout) {
  const svg_data = svg.build_data({}, this._styles, {});
  const svg_el = svg.render(svg_data);

  const controls_data = controls.build_data({}, this._styles, {});
  const controls_el = controls.render(controls_data);

  const free_data = f.build_data({}, this._styles, {});
  const free_el = f.render(free_data);

  layout.forEach(data => {
    const fn = rendering_fns[data.kind];
    const element = fn(data);
    svg_el.appendChild(element);
  });

  svg_el.appendChild(free_el);

  const target = document.querySelector(this._container);
  target.appendChild(controls_el);
  target.appendChild(svg_el);

  qt.render(layout, this._styles, { target: svg_el });

  return {
    target_el: target,
    svg_el,
    free_el
  };
}

Specimen.prototype.animate = function(layout, elements) {
  const by_id = ci.index_by_id(layout);
  const by_name = ci.index_by_name(by_id);
  const objs = Object.values(by_id)

  const unpack_by_id = (id) => ci.unpack(by_id, id);
  const unpack_by_name = (name) => unpack_by_id(by_name[name]);
  const pack = (obj) => ci.pack(obj, by_id);

  const data_fns = {
    by_id: unpack_by_id,
    by_name: unpack_by_name,
    pack: pack
  };

  const { free_el } = elements;

  let rt_context = rt.init_runtime(objs, data_fns);
  const animation_context = a.init_animation_context();

  let anime_commands = [];
  let anime_callbacks = [];

  while (rt_context.drained != true) {
    const next_context = rt.tick(rt_context)
    const action = next_context.action;
    const lineage = next_context.lineage;

    if (action) {
      a.update_layout(action, data_fns, this._styles, free_el);
      const action_animation_seq = a.animation_seq(action, data_fns, this._styles);
      const action_anime_data = a.anime_data(animation_context, action_animation_seq, lineage, this._styles);

      anime_commands = anime_commands.concat(action_anime_data.commands);
      anime_callbacks = anime_callbacks.concat(action_anime_data.callbacks);
    }

    rt_context = next_context;
  }

  const timeline = anime.timeline({
    autoplay: true
  });

  anime_commands.forEach(c => timeline.add(c.params, c.t));
}

Specimen.prototype.render = function() {
  const layout = this.horizontal_layout();
  const elements = this.draw_layout(layout);
  this.animate(layout, elements);
}
