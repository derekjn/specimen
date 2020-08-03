import { build_dynamic_container_data, build_dynamic_row_data } from './components/row';
import { keep_animation_sequence, keep_animations } from './animations/keep';
import { select_keys, relative_add, relative_sub } from './util';

export function build_dynamic_elements_data(layout_index, actions, styles) {
  return actions.reduce((all, action) => {
    const { from, old_row } = action;

    const right_x = layout_index[old_row.collection].partitions[old_row.partition].right_x;
    const top_y = layout_index[old_row.collection].partitions[old_row.partition].brackets.tr.y;

    all[old_row.id] = build_dynamic_row_data(old_row, styles, {
      right_x: right_x,
      top_y: top_y
    });

    return all;
  }, {});
}

export function animation_sequence(layout_index, dynamic_elements, actions, styles) {
  let seq = [];

  actions.forEach(action => {
    seq.push(keep_animation_sequence(action, layout_index, dynamic_elements, styles));
  });
  
  return seq;
}

export function anime_data(seq, lineage) {
  const ms_px = 3;

  let result = {
    commands: [],
    callbacks: []
  };
  let history = {};
  let t = {};

  seq.forEach((change) => {
    const { commands: cmds, callbacks: cbs } = keep_animations(change, t, history, lineage);

    cmds.forEach(cmd => {
      result.commands.push(cmd);
    });

    cbs.forEach(cb => {
      result.callbacks.push(cb)
    });
  });

  return result;
}
