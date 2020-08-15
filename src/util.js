export function uuidv4() {
  return 'id-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function inverse_map(m) {
  return Object.entries(m).reduce((all, [k, v]) => {
    let new_v = all[v] || [];
    new_v.push(k);
    all[v] = new_v;

    return all;
  }, {})
};

export function index_by_name(layout) {
  return layout.reduce((all, x) => {
    all[x.name] = x;
    return all;
  }, {});
}

export function index_by(xs, k) {
  return xs.reduce((all, x) => {
    all[x[k]] = x;

    return all;
  }, {});
}

export function cycle_array(arr) {
  arr.push(arr.shift());
  return arr;
}

export function select_keys(m, keys) {
  return keys.reduce((all, key) => {
    all[key] = m[key];
    return all;
  }, {});
}

export function relative_add(x) {
  return "+=" + x;
}

export function relative_sub(x) {
  return "-=" + x;
}

export function ms_for_translate(m, ms) {
  return (Math.abs(m.translateX || 0) + Math.abs(m.translateY || 0)) * ms;
}

export function create_svg_el(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag);
}
