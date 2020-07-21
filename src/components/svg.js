import $ from 'jquery';

export function build_svg_data(styles) {
  const { svg_width, svg_height, svg_target } = styles;

  return {
    kind: "svg",
    width: svg_width,
    height: svg_height,
    target: svg_target
  };
}

export function render_svg(container, data) {
  const { width, height, target } = data;

  const html = `<svg class="${target}" width="${width}" height="${height}"></svg>`;
  $(container).append(html);
}
