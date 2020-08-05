import { select_keys, relative_add, relative_sub, ms_for_translate } from './../util';
import { update_pq_offsets, update_stream_time_text } from './common';

export function discard_animation_sequence(action, layout_index, dynamic_elements, styles) {
  const { old_row: row, processed_by, new_offsets, old_offsets } = action;
  const { row_width } = styles;
  const { consumer_m_margin_right, d_row_enter_offset } = styles;

  const row_position = dynamic_elements[row.id];

  const pq_data = layout_index[action.processed_by];
  const pq_enter_x = pq_data.brackets.bl.x;
  const pq_enter_y = pq_data.midpoint_y;
  const pq_midpoint_x = pq_data.midpoint_x;
  const pq_exit_y = pq_enter_y;
  const pq_bottom_y = pq_data.brackets.bl.y;

  // Row position rendering changes.
  const appear_x = row_position.x;
  const appear_y = row_position.y;

  const move_to_pq_center_x = (pq_enter_x - d_row_enter_offset);
  const move_to_pq_center_y = pq_enter_y;

  const approach_pq_x = pq_enter_x;
  const cross_half_pq_x = pq_midpoint_x;
  const fall_away_y = pq_bottom_y;

  // Consumer marker changes.
  const consumer_marker_old_x = dynamic_elements.consumer_markers[row.collection][row.partition][processed_by].x;
  const consumer_marker_new_x = (dynamic_elements[row.derived_id].x + (row_width / 2)) - consumer_m_margin_right;

  dynamic_elements.consumer_markers[row.collection][row.partition][processed_by].x = consumer_marker_new_x;

  let consumer_marker_opacity = undefined;
  if(row.offset == 0) {
    consumer_marker_opacity = [0, 1];
  }

  // Fill changes.
  dynamic_elements[row.id].fill = dynamic_elements[row.derived_id].fill;

  return {
    kind: "discard",
    data: {
      row: row,
      processed_by: processed_by,
      old_offsets: old_offsets,
      new_offsets: new_offsets,
      old_stream_time: action.old_stream_time,
      new_stream_time: action.new_stream_time,
      stream_time_id: pq_data.stream_time.id,
      consumer_id: dynamic_elements.consumer_markers[row.collection][row.partition][processed_by].id,
    },
    animations: {
      appear: {
        fill: dynamic_elements[row.derived_id].fill
      },
      move_to_pq_center: {
        translateX: (move_to_pq_center_x - appear_x),
        translateY: (move_to_pq_center_y - appear_y)
      },
      approach_pq: {
        translateX: (approach_pq_x - move_to_pq_center_x)
      },
      cross_half_pq: {
        translateX: (cross_half_pq_x - approach_pq_x),
      },
      fall_away: {
        translateY: (fall_away_y - move_to_pq_center_y),
        opacity: [1, 0]
      },
      move_consumer_marker: {
        translateX: (consumer_marker_old_x - consumer_marker_new_x),
        opacity: consumer_marker_opacity
      }
    }
  };
}

export function discard_animations(change, t, history, lineage) {
  const { data, animations } = change;
  const ms_px = 2;

  const pq_t = (t[data.processed_by] || 0);
  const row_history = (history[lineage[data.row.id]] || 0);
  const t_offset = ((row_history >= pq_t) ? row_history : pq_t);

  const appear_ms = 250;
  const move_to_pq_center_ms = ms_for_translate(animations.move_to_pq_center, ms_px);
  const approach_pq_ms = ms_for_translate(animations.approach_pq, ms_px);
  const cross_half_pq_ms = ms_for_translate(animations.cross_half_pq, ms_px);
  const fall_away_ms = ms_for_translate(animations.fall_away, ms_px);

  const consumer_marker_ms = ms_for_translate(animations.move_consumer_marker, ms_px);

  const row_movement = {
    t: t_offset,
    params: {
      targets: `.id-${data.row.id}`,
      easing: "linear",
      keyframes: [
        {
          duration: appear_ms,
          opacity: [0, 1],
          fill: animations.appear.fill
        },
        {
          duration: move_to_pq_center_ms,
          translateX: relative_add(animations.move_to_pq_center.translateX),
          translateY: relative_add(animations.move_to_pq_center.translateY)
        },
        {
          duration: approach_pq_ms,
          translateX: relative_add(animations.approach_pq.translateX)
        },
        {
          duration: cross_half_pq_ms,
          translateX: relative_add(animations.cross_half_pq.translateX),
        },
        {
          duration: fall_away_ms,
          translateY: relative_add(animations.fall_away.translateY),
          opacity: animations.fall_away.opacity
        }
      ]
    }
  };

  t[data.processed_by] = (t_offset + appear_ms + move_to_pq_center_ms + approach_pq_ms);

  const consumer_marker_movement = {
    t: t_offset + appear_ms,
    params: {
      targets: `.coll-${data.row.collection}.partition-${data.row.partition}.consumer-${data.processed_by}.id-${data.consumer_id}`,
      easing: "linear",
      keyframes: [
        {
          duration: 1,
          opacity: animations.move_consumer_marker.opacity
        },
        {
          duration: consumer_marker_ms,
          translateX: relative_sub(animations.move_consumer_marker.translateX)
        }
      ]
    }
  };

  const update_offset_text = {
    t: (
      t_offset +
        appear_ms +
        move_to_pq_center_ms +
        approach_pq_ms
    ),
    apply: function() {
      update_pq_offsets(data.processed_by, data.new_offsets);
    },
    undo: function() {
      update_pq_offsets(data.processed_by, data.old_offsets);
    }
  };

  const update_stream_time = {
    t: (
      t_offset +
        appear_ms +
        move_to_pq_center_ms +
        approach_pq_ms
    ),
    apply: function() {
      update_stream_time_text(data.stream_time_id, data.new_stream_time);
    },
    undo: function() {
      update_stream_time_text(data.stream_time_id, data.old_stream_time);
    }
  };

  return {
    commands: [
      row_movement,
      consumer_marker_movement
    ],
    callbacks: [
      update_offset_text,
      update_stream_time
    ]
  };
}
