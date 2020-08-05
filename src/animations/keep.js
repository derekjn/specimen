import { relative_add, relative_sub, ms_for_translate } from './../util';
import { update_pq_offsets, update_row_popover, update_stream_time_text } from './common';

export function keep_animation_sequence(action, layout_index, dynamic_elements, styles) {
  const { old_row, new_row, processed_by, new_offsets, old_offsets } = action;
  const { row_width, row_height, row_margin_left, row_offset_right } = styles;
  const { consumer_m_margin_right, d_row_enter_offset } = styles;

  const old_row_position = dynamic_elements[old_row.id];

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

  // Row position rendering changes.
  const appear_x = old_row_position.x;
  const appear_y = old_row_position.y;

  const move_to_pq_center_x = (pq_enter_x - d_row_enter_offset);
  const move_to_pq_center_y = pq_enter_y;

  const approach_pq_x = pq_enter_x;
  const traverse_pq_x = pq_exit_x;
  const depart_pq_x = (traverse_pq_x + d_row_enter_offset);

  const move_to_partition_center_x = (new_part_x - d_row_enter_offset);
  const move_to_partition_center_y = new_part_y;

  const enter_partition_x = new_row_x;

  // Row position data changes.
  dynamic_elements[old_row.id].x = new_row_x;
  dynamic_elements[old_row.id].y = new_part_y;

  // Consumer marker changes.
  const consumer_marker_old_x = dynamic_elements.consumer_markers[old_row.collection][old_row.partition][processed_by].x;
  const consumer_marker_new_x = (dynamic_elements[old_row.derived_id].x + (row_width / 2)) - consumer_m_margin_right;

  dynamic_elements.consumer_markers[old_row.collection][old_row.partition][processed_by].x = consumer_marker_new_x;

  let consumer_marker_opacity = undefined;
  if(old_row.offset == 0) {
    consumer_marker_opacity = [0, 1];
  }

  // Fill changes.
  dynamic_elements[old_row.id].fill = dynamic_elements[old_row.derived_id].fill;

  let fill_change = undefined;
  if(pq_data.style.fill) {
    const new_fill = pq_data.style.fill(old_row, new_row);      
    fill_change = [dynamic_elements[old_row.id].fill, new_fill];
    dynamic_elements[old_row.id].fill = new_fill;
  }

  return {
    kind: "keep",
    data: {
      old_row: old_row,
      new_row: new_row,
      processed_by: processed_by,
      consumer_id: dynamic_elements.consumer_markers[old_row.collection][old_row.partition][processed_by].id,
      old_offsets: old_offsets,
      new_offsets: new_offsets,
      old_stream_time: action.old_stream_time,
      new_stream_time: action.new_stream_time,
      stream_time_id: pq_data.stream_time.id
    },
    animations: {
      appear: {
        fill: dynamic_elements[old_row.derived_id].fill
      },
      move_to_pq_center: {
        translateX: (move_to_pq_center_x - appear_x),
        translateY: (move_to_pq_center_y - appear_y)
      },
      approach_pq: {
        translateX: (approach_pq_x - move_to_pq_center_x)
      },
      traverse_pq: {
        translateX: (traverse_pq_x - approach_pq_x),
        fill: fill_change
      },
      depart_pq: {
        translateX: (depart_pq_x - traverse_pq_x)
      },
      move_to_partition_center: {
        translateX: (move_to_partition_center_x - depart_pq_x),
        translateY: (move_to_partition_center_y - move_to_pq_center_y)
      },
      enter_partition: {
        translateX: (enter_partition_x - move_to_partition_center_x)
      },
      move_consumer_marker: {
        translateX: (consumer_marker_old_x - consumer_marker_new_x),
        opacity: consumer_marker_opacity
      }
    }
  };
}

export function keep_animations(change, t, history, lineage) {
  const { data, animations } = change;
  const ms_px = 2;

  const pq_t = (t[data.processed_by] || 0);
  const row_history = (history[lineage[data.old_row.id]] || 0);
  const t_offset = ((row_history >= pq_t) ? row_history : pq_t);

  const appear_ms = 250;
  const move_to_pq_center_ms = ms_for_translate(animations.move_to_pq_center, ms_px);
  const approach_pq_ms = ms_for_translate(animations.approach_pq, ms_px);
  const traverse_pq_ms = ms_for_translate(animations.traverse_pq, ms_px);
  const depart_pq_ms = ms_for_translate(animations.depart_pq, ms_px);
  const move_to_partition_center_ms = ms_for_translate(animations.move_to_partition_center, ms_px);
  const enter_partition_ms = ms_for_translate(animations.enter_partition, ms_px);

  const consumer_marker_ms = ms_for_translate(animations.move_consumer_marker, ms_px);

  const row_movement = {
    t: t_offset,
    params: {
      targets: `.id-${data.old_row.id}`,
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
          duration: traverse_pq_ms,
          translateX: relative_add(animations.traverse_pq.translateX),
          fill: animations.traverse_pq.fill,
        },
        {
          duration: depart_pq_ms,
          translateX: relative_add(animations.depart_pq.translateX)
        },
        {
          duration: move_to_partition_center_ms,
          translateX: relative_add(animations.move_to_partition_center.translateX),
          translateY: relative_add(animations.move_to_partition_center.translateY)
        },
        {
          duration: enter_partition_ms,
          translateX: relative_add(animations.enter_partition.translateX)
        }
      ]
    }
  };

  t[data.processed_by] = (t_offset + appear_ms + move_to_pq_center_ms + approach_pq_ms);
  history[data.old_row.id] = (
    t_offset +
      appear_ms +
      move_to_pq_center_ms +
      approach_pq_ms +
      traverse_pq_ms +
      depart_pq_ms +
      move_to_partition_center_ms +
      enter_partition_ms
  );

  const consumer_marker_movement = {
    t: t_offset + appear_ms,
    params: {
      targets: `.coll-${data.old_row.collection}.partition-${data.old_row.partition}.consumer-${data.processed_by}.id-${data.consumer_id}`,
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

  const update_row_summary = {
    t: (
      t_offset +
        appear_ms +
        move_to_pq_center_ms +
        approach_pq_ms +
        traverse_pq_ms
    ),
    apply: function() {
      update_row_popover(data.old_row.id, data.new_row);
    },
    undo: function() {
      update_row_popover(data.old_row.id, data.old_row);
    }
  };

  return {
    commands: [
      row_movement,
      consumer_marker_movement
    ],
    callbacks: [
      update_offset_text,
      update_stream_time,
      update_row_summary
    ]
  };
}
