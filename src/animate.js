import { build_dynamic_container_data, build_dynamic_row_data } from './components/row';
import { relative_add, relative_sub } from './util';

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
  const { row_width, row_height, row_margin_left, row_offset_right } = styles;
  const { consumer_m_margin_right } = styles;

  let seq = [];

  actions.forEach(action => {
    const { old_row, new_row, processed_by } = action;

    const old_row_position = dynamic_elements[old_row.id];
    const old_row_x = old_row_position.x;
    const old_row_y = old_row_position.y;

    const pq_data = layout_index[action.processed_by];
    const pq_enter_x = pq_data.brackets.bl.x;
    const pq_enter_y = pq_data.midpoint_y;
    const pq_exit_x = pq_data.brackets.br.x;
    const pq_exit_y = pq_enter_y;

    const new_part_x = layout_index[new_row.collection].partitions[new_row.partition].brackets.bl.x;
    const new_part_y = layout_index[new_row.collection].partitions[new_row.partition].midpoint_y - (row_height / 2);

    const new_part_start_x = layout_index[new_row.collection].partitions[new_row.partition].brackets.tr.x;
    const new_part_margin = ((new_row.offset - 1) * row_margin_left);
    const new_part_spacing = (new_row.offset * row_width);

    const new_row_x = new_part_start_x - new_part_margin - row_offset_right - new_part_spacing - row_width;

    dynamic_elements[old_row.id].x = new_row_x;
    dynamic_elements[old_row.id].y = new_part_y;

    const consumer_marker_old_x = dynamic_elements.consumer_markers[old_row.collection][old_row.partition][processed_by].x;
    const consumer_marker_new_x = (dynamic_elements[old_row.derived_id].x + (row_width / 2)) - consumer_m_margin_right;

    dynamic_elements.consumer_markers[old_row.collection][old_row.partition][processed_by].x = consumer_marker_new_x;

    seq.push({
      kind: "transformation",
      data: {
        row: old_row,
        processed_by: processed_by,
      },
      animations: {
        appear: {

        },
        enter_pq: {
          translateX: (pq_enter_x - old_row_x),
          translateY: (pq_enter_y - old_row_y)
        },
        cross_pq: {
          translateX: (pq_exit_x - pq_enter_x)
        },
        exit_pq: {
          translateX: (new_part_x - pq_exit_x),
          translateY: (new_part_y - pq_exit_y)
        },
        settle: {
          translateX: (new_row_x - new_part_x)
        },
        move_consumer_marker: {
          translateX: (consumer_marker_old_x - consumer_marker_new_x)
        }
      }
    });
  });
  
  return seq;
}

function transformation_animations(change, t, history, lineage) {
  const { data, animations } = change;
  const ms_px = 3;
  const intro = 250;

  const pq_t = (t[data.processed_by] || 0);
  const row_history = (history[lineage[data.row.id]] || 0);
  const t_offset = ((row_history >= pq_t) ? row_history : pq_t);

  const entering_motion = (Math.abs(animations.enter_pq.translateX) + Math.abs(animations.enter_pq.translateY)) * ms_px;
  const crossing_motion = (Math.abs(animations.cross_pq.translateX)) * ms_px;
  const exiting_motion = (Math.abs(animations.exit_pq.translateX) + Math.abs(animations.exit_pq.translateY)) * ms_px;
  const settling_motion = (Math.abs(animations.settle.translateX)) * ms_px;
  const consumer_motion = (Math.abs(animations.move_consumer_marker.translateX)) * ms_px;

  const row_movement = {
    t: t_offset,
    params: {
      targets: `.id-${data.row.id}`,
      easing: "linear",
      keyframes: [
        {
          duration: intro,
          opacity: [0, 1]
        },
        {
          duration: entering_motion,
          translateX: relative_add(animations.enter_pq.translateX),
          translateY: relative_add(animations.enter_pq.translateY)
        },
        {
          duration: crossing_motion,
          translateX: relative_add(animations.cross_pq.translateX),
          fill: ["#6B84FF", "#FFE56B"]
        },
        {
          duration: exiting_motion,
          translateX: relative_add(animations.exit_pq.translateX),
          translateY: relative_add(animations.exit_pq.translateY)
        },
        {
          duration: settling_motion,
          translateX: relative_add(animations.settle.translateX)
        }
      ]
    }
  };

  t[data.processed_by] = (t_offset + intro + entering_motion);
  history[data.row.id] = t_offset + intro + entering_motion + crossing_motion + exiting_motion + settling_motion;

  const consumer_marker_movement = {
    t: t_offset + intro,
    params: {
      targets: `.coll-${data.row.collection}.partition-${data.row.partition}.consumer-${data.processed_by}`,
      easing: "linear",
      keyframes: [
        {
          duration: 1,
          opacity: [0, 1]
        },
        {
          duration: consumer_motion,
          translateX: relative_sub(animations.move_consumer_marker.translateX)
        }
      ]
    }
  }

  return [
    row_movement,
    consumer_marker_movement
  ];
}

export function anime_commands(seq, lineage) {
  const ms_px = 3;
  let commands = [];
  let history = {};
  let t = {};

  seq.forEach((change) => {
    const subcommands = transformation_animations(change, t, history, lineage);

    subcommands.forEach(subcommand => {
      commands.push(subcommand);
    });
  });

  return commands;
}
