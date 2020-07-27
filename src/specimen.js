import * as graphlib from 'graphlib';
import $ from 'jquery';
import anime from 'animejs/lib/anime.es.js';
import {
  uuidv4,
  inverse_map,
  index_by_name,
  index_by,
  cycle_array,
  select_keys,
  relative_add,
} from './util';
import { build_collection_data, render_collection } from './components/collection';
import { build_persistent_query_data } from './components/persistent-query';
import { vertically_center_layout } from "./vertical";
import { build_controls_data, render_controls } from './components/controls';
import { build_svg_data, render_svg } from './components/svg';
import { render_persistent_query } from './components/persistent-query';
import { build_dynamic_container_data } from './components/row';
import { build_consumer_markers_data, render_consumer_marker } from './components/consumer-marker';
import { run_until_drained } from './runtime';
import { build_dynamic_elements_data, animation_sequence, anime_commands } from './animate';

import { styles } from './styles';

function build_data(node, styles, computed) {
  switch(node.kind) {
  case "collection":
    return build_collection_data(node, styles, computed);

  case "persistent_query":
    return build_persistent_query_data(node, styles, computed);
  }
}

function add_metadata(component, styles) {
  const { row_default_fill } = styles;
  
  switch(component.kind) {
  case "collection":
    Object.entries(component.partitions).forEach(([id, partition]) => {
      partition.forEach((row, i) => {
        row.source_id = uuidv4();
        row.collection = component.name;
        row.partition = id;
        row.offset = i;
        row.style = { ...{ fill: row_default_fill }, ...row.style };
      });
    });

    return component;
  default:
    return component;
  }
}

export function Specimen(styles) {
  this._graph = new graphlib.Graph();
  this._styles = styles;
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
      const { data, state } = build_data(node, this._styles, computed);

      data.name = name;
      top_y = state.bottom_y;
      result.push(data)
    });

    all.push(result);
    return all;
  }, []);

  return vertically_center_layout(layout).flatMap(xs => xs);
}

function render(data) {
  switch(data.kind) {
  case "collection":
    render_collection(data);
    break;
  case "persistent_query":
    render_persistent_query(data);
    break;
  }
}

function render_dynamic_container(data) {
  const { container, dynamic_target } = data;

  const html = `<g class="${dynamic_target}"></g>`;
  $("." + container).append(html);
}

function render_dynamic_row(data) {
  const { container, width, height, x, y, fill } = data;
  const { id, collection, partition, offset } = data;

  const html = `<rect width="${width}" height="${height}" x="${x}" y="${y}" class="row id-${id} collection-${collection} partition-${partition} offset-${offset}" fill="${fill}"></rect>`;

  $("." + container).append(html);  
}

Specimen.prototype.render = function(layout, container) {
  const controls_data = build_controls_data(this._styles);
  render_controls(container, controls_data);

  const { svg_width } = this._styles;
  const svg_data = build_svg_data(this._styles);
  render_svg(container, svg_data);

  layout.forEach(data => render(data));

  // Repaint.
  $(container).html($(container).html());
}

Specimen.prototype.consumer_graph = function() {
  const kinds = this.node_kinds();
  const pqs = Object.keys(kinds.persistent_query);

  return Object.entries(kinds.collection).reduce((all, [name, { partitions }]) => {
    const children = this.children(name);
    const child_pqs = children.filter(child => pqs.includes(child));

    all[name] = Object.keys(partitions).reduce((parts, part) => {
      parts[part] = child_pqs;
      return parts;
    }, {});

    return all;
  }, {});
}

Specimen.prototype.static_row_index = function(layout_index) {
  const sources = this.source_collections();
  let result = {};

  sources.forEach(source => {
    layout_index[source].partitions.forEach(partition => {
      partition.rows.forEach(row => {
        result[row.source_id] = row;
      });
    });
  });

  return result;
}

Specimen.prototype.animate = function(layout, container) {
  const layout_index = index_by_name(layout);
  const consumer_graph = this.consumer_graph();
  const static_row_index = this.static_row_index(layout_index);

  const { actions, lineage } = run_until_drained(this);

  const dynamic_container_data = build_dynamic_container_data(this._styles);
  const dynamic_data = build_dynamic_elements_data(layout_index, actions, this._styles);
  const consumer_markers = build_consumer_markers_data(layout_index, consumer_graph, this._styles);

  render_dynamic_container(dynamic_container_data);
  Object.values(dynamic_data).forEach(data => render_dynamic_row(data));

  const all_dynamic_data = { ...dynamic_data,
                             ...static_row_index,
                             ...{
                               consumer_markers: consumer_markers
                             }};

  Object.entries(consumer_markers).forEach(([coll, partitions]) => {
    Object.entries(partitions).forEach(([partition, pqs]) => {
      Object.entries(pqs).forEach(([pq, data]) => {
        render_consumer_marker(data);
      });
    });
  });

  $(container).html($(container).html());

  const animations = animation_sequence(layout_index, all_dynamic_data, actions, this._styles);
  const commands = anime_commands(animations, lineage);

  var controlsProgressEl = $(container + " > .controls > .progress");

  const timeline = anime.timeline({
    loop: true,
    update: function(anim) {
      controlsProgressEl.val(timeline.progress);
    }
  });

  $(container + " > .controls > .play").click(timeline.play);
  $(container + " > .controls > .pause").click(timeline.pause);
  $(container + " > .controls > .restart").click(timeline.restart);

  controlsProgressEl.on('input', function() {
    timeline.pause();
    timeline.seek(timeline.duration * (controlsProgressEl.val() / 100));
  });

  commands.forEach(c => timeline.add(c.params, c.t));
}
