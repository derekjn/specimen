function build_data(node, styles, computed) {
  switch(node.kind) {
  case "collection":
    return build_collection_data(node, styles, computed);

  case "persistent_query":
    return build_persistent_query_data(node, styles, computed);
  }
}

function add_metadata(component) {
  switch(component.kind) {
  case "collection":
    Object.entries(component.partitions).forEach(([id, partition]) => {
      partition.forEach((row, i) => {
        row.id = uuidv4();
        row.collection = component.name;
        row.partition = id;
        row.offset = i;
      });
    });

    return component;
  default:
    return component;
  }
}

export function Specimen() {
  this._graph = new graphlib.Graph();
}

Specimen.prototype.add_root = function(node) {
  this._graph.setNode(node.name, add_metadata(node));
  return this;
}

Specimen.prototype.add_child = function(parents, node) {
  this._graph.setNode(node.name, add_metadata(node));

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

Specimen.prototype.sink_collections = function() {
  return this._graph.sinks();
}

Specimen.prototype.parents = function(name) {
  return this._graph.predecessors(name);
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

Specimen.prototype.horizontal_layout = function(styles) {
  const { svg_width } = styles;

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
      const { data, state } = build_data(node, styles, computed);

      data.name = name;
      top_y = state.bottom_y;
      result.push(data)
    });

    all.push(result);
    return all;
  }, []);

  return vertically_center_layout(layout).flatMap(xs => xs);
}

Specimen.prototype.render = function(layout, container, styles) {
  const controls_data = build_controls_data(styles);
  render_controls(container, controls_data);

  const { svg_width } = styles;
  const svg_data = build_svg_data(styles);
  render_svg(container, svg_data);

  layout.forEach(data => render(data));

  // Repaint.
  $(container).html($(container).html());
}

Specimen.prototype.animate = function(layout, container, styles) {
  const layout_index = index_by_name(layout);
  const { actions, lineage } = run_until_drained(this);

  const dynamic_container_data = build_dynamic_container_data(styles);
  const dynamic_data = build_dynamic_elements_data(layout_index, actions, styles);

  render_dynamic_container(dynamic_container_data);
  Object.values(dynamic_data).forEach(data => render_dynamic_row(data));
  $(container).html($(container).html());

  const animations = animation_sequence(layout_index, dynamic_data, actions, styles);
  const commands = anime_commands(animations, lineage);

  var controlsProgressEl = $(container + " > .controls > .progress");

  const timeline = anime.timeline({
    update: function(anim) {
      controlsProgressEl.val(timeline.progress);
    }
  });

  $(container + " > .controls > .play").click(timeline.play);
  $(container + " > .controls > .pause").click(timeline.pause);
  $(container + " > .controls > .restart").click(timeline.restart);

  controlsProgressEl.on('input', function() {
    timeline.seek(timeline.duration * (controlsProgressEl.val() / 100));
  });

  commands.forEach(c => timeline.add(c.params, c.t));
}
