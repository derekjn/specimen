import $ from 'jquery';

export function build_controls_data(styles) {
  return {
    start: 0,
    step: .001
  }
}

export function render_controls(container, data) {
  const html = `
<div class="controls">    
    <button class="play">Play</button>
    <button class="pause">Pause</button>
    <button class="restart">Restart</button>
    <input class="progress" step="${data.step}" type="range" min="0" max="100" value="${data.start}"/>
</div>
`;

  $(container).append(html);
}
