import { build_dynamic_container_data, build_dynamic_row_data } from './components/row';
import { relative_add } from './util';

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
  const { row_width, row_margin_left, row_offset_right } = styles;

  let seq = [];

  actions.forEach(action => {
    const { old_row, new_row, processed_by } = action;
    const target = `.id-${old_row.id}`;

    const old_row_position = dynamic_elements[old_row.id];
    const old_row_x = old_row_position.x;
    const old_row_y = old_row_position.y;

    const row_width = dynamic_elements[old_row.id].width;

    const pq_data = layout_index[action.processed_by];
    const pq_enter_x = pq_data.brackets.bl.x;
    const pq_enter_y = pq_data.midpoint_y;
    const pq_exit_x = pq_data.brackets.br.x;
    const pq_exit_y = pq_enter_y;

    const new_part_x = layout_index[new_row.collection].partitions[new_row.partition].brackets.bl.x;
    const new_part_y = layout_index[new_row.collection].partitions[new_row.partition].midpoint_y;

    const new_part_start_x = layout_index[new_row.collection].partitions[new_row.partition].brackets.tr.x;
    const new_part_margin = ((new_row.offset - 1) * row_margin_left);
    const new_part_spacing = (new_row.offset * row_width);

    const new_row_x = new_part_start_x - new_part_margin - row_offset_right - new_part_spacing;

    dynamic_elements[old_row.id].x = new_row_x;
    dynamic_elements[old_row.id].y = new_part_y;

    seq.push({
      id: old_row.id,
      processed_by: processed_by,
      animation: [
        {
          target: target,
          translateX: (pq_enter_x - old_row_x) - row_width,
          translateY: (pq_enter_y - old_row_y)
        },
        {
          target: target,
          translateX: (pq_exit_x - pq_enter_x)
        },
        {
          target: target,
          translateX: (new_part_x - pq_exit_x),
          translateY: (new_part_y - pq_exit_y)
        },
        {
          target: target,
          translateX: (new_row_x - new_part_x)
        }
      ]
    });
  });
  
  return seq;
}

export function anime_commands(seq, lineage) {
  const ms_px = 3;
  let commands = [];
  let history = {};
  let t = {};

  seq.forEach(({ id, processed_by, animation }) => {
    const intro = 250;
    const entering_motion = (Math.abs(animation[0].translateX) + Math.abs(animation[0].translateY)) * ms_px;
    const crossing_motion = (animation[1].translateX) * ms_px;
    const exiting_motion = (Math.abs(animation[2].translateX) + Math.abs(animation[2].translateY)) * ms_px;
    const settling_motion = (animation[3].translateX) * ms_px;
    const pq_t = (t[processed_by] || 0);
    const row_history = (history[lineage[id]] || 0);
    const t_offset = ((row_history >= pq_t) ? row_history : pq_t);

    commands.push({
      params: {
        targets: animation[0].target,
        easing: "linear",
        keyframes: [
          {
            duration: intro,
            opacity: [0, 1]
          },
          {
            duration: entering_motion,
            translateX: relative_add(animation[0].translateX),
            translateY: relative_add(animation[0].translateY)
          },
          {
            duration: crossing_motion,
            translateX: relative_add(animation[1].translateX),
            fill: ["#6B84FF", "#FFE56B"]
          },
          {
            duration: exiting_motion,
            translateX: relative_add(animation[2].translateX),
            translateY: relative_add(animation[2].translateY)
          },
          {
            duration: settling_motion,
            translateX: relative_add(animation[3].translateX)
          }
        ]
      },
      t: t_offset
    });

    t[processed_by] = (t_offset + intro + entering_motion);
    history[id] = t_offset + intro + entering_motion + crossing_motion + exiting_motion + settling_motion;
  });

  return commands;
}
