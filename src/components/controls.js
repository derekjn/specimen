import { uuidv4 } from './../util';

export function build_data(config, styles, computed) {
  return {
    kind: "controls",
    id: uuidv4(),
    rendering: {
      play: {
        id: uuidv4(),
        text: "Play"
      },
      pause: {
        id: uuidv4(),
        text: "Pause"
      },
      restart: {
        id: uuidv4(),
        text: "Restart"
      },
      manual_left: {
        id: uuidv4(),
        text: "Manual <"
      },
      manual_right: {
        id: uuidv4(),
        text: "Manual >"
      },
      progress: {
        id: uuidv4(),
        min: 0,
        max: 0,
        start: 0,
        step: .001
      }
    }
  };
}

export function render(data) {
  const { id, rendering } = data;

  const div = document.createElement("div");
  div.id = id;
  div.classList.add("controls");

  const play = document.createElement("button");
  play.id = rendering.play.id;
  play.textContent = rendering.play.text;

  const pause = document.createElement("button");
  pause.id = rendering.pause.id;
  pause.textContent = rendering.pause.text;

  const restart = document.createElement("button");
  restart.id = rendering.restart.id;
  restart.textContent = rendering.restart.text;

  const manual_left = document.createElement("button");
  manual_left.id = rendering.manual_left.id;
  manual_left.textContent = rendering.manual_left.text;

  const manual_right = document.createElement("button");
  manual_right.id = rendering.manual_right.id;
  manual_right.textContent = rendering.manual_right.text;

  const progress = document.createElement("input");
  progress.setAttribute("type", "range");
  progress.setAttribute("min", rendering.progress.min);
  progress.setAttribute("max", rendering.progress.max);
  progress.setAttribute("step", rendering.progress.step);
  progress.setAttribute("value", rendering.progress.start);

  div.appendChild(play);
  div.appendChild(pause);
  div.appendChild(restart);
  div.appendChild(manual_left);
  div.appendChild(manual_right);
  div.appendChild(progress);

  return div;
}
