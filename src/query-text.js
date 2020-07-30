const code_padding = 20;

function make_code_container(code) {
  const new_code = document.createElement("code");
  new_code.classList.add("lang-sql");
  new_code.innerText = code.join("\n");

  const new_pre = document.createElement("pre");
  new_pre.style.position = "absolute";
  new_pre.style.bottom = "0";
  new_pre.style.left = "0";
  new_pre.style.right = "0";

  new_pre.style.marginLeft = "auto";
  new_pre.style.marginRight = "auto";
  new_pre.appendChild(new_code);

  return {
    pre: new_pre,
    code: new_code
  };
}

function make_parent_container(children) {
  const new_div = document.createElement("div");
  new_div.style.position = "relative";
  new_div.classList.add("pq-code-container");

  children.forEach(child => new_div.appendChild(child.pre));

  return new_div;
}

function set_pre_width({ pre, code }) {
  pre.style.width = `${code.offsetWidth + code_padding}px`;
}

function set_parent_height(parent, children) {
  const heights = children.map(child => child.pre.offsetHeight);
  const height = Math.max(...heights);
  parent.style.height = `${height}px`;
}

function set_pre_transform(pq, { pre }, svg_width) {
  const x = (pq.line.x1) - (svg_width / 2);

  pre.style.webkitTransform = `translateX(${x}px)`;
  pre.style.MozTransform = `translateX(${x}px)`;
  pre.style.msTransform = `translateX(${x}px)`;
  pre.style.OTransform = `translateX(${x}px)`;
  pre.style.transform = `translateX(${x}px)`;
}

export function render_query_text(layout, svg_target, svg_width) {
  const pqs = layout.filter(component => component.kind == "persistent_query");
  const children = pqs.map(pq => make_code_container(pq.query_text));
  const parent = make_parent_container(children);

  const target = document.querySelector(`.${svg_target}`);
  target.insertAdjacentElement('beforebegin', parent);

  children.forEach(child => set_pre_width(child));
  set_parent_height(parent, children);

  pqs.forEach((pq, i) => set_pre_transform(pq, children[i], svg_width));  
}
