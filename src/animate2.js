import * as k from "./animations2/keep";

let update_layout_fns = {
  "keep": k.update_layout
};

let animation_seq_fns = {
  "keep": k.animation_seq
};

export function update_layout(action, data_fns, styles, free_el) {
  const layout_fn = update_layout_fns[action.kind];
  layout_fn(action, data_fns, styles, free_el);
}

export function animation_seq(action, data_fns, styles) {
  const animation_seq_fn = animation_seq_fns[action.kind];
  return animation_seq_fn(action, data_fns, styles);
}
