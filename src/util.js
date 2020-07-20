function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function inverse_map(m) {
  return Object.entries(m).reduce((all, [k, v]) => {
    let new_v = all[v] || [];
    new_v.push(k);
    all[v] = new_v;

    return all;
  }, {})
};

function index_by_name(layout) {
  return layout.reduce((all, x) => {
    all[x.name] = x;
    return all;
  }, {});
}

function index_by(xs, k) {
  return xs.reduce((all, x) => {
    all[x[k]] = x;

    return all;
  }, {});
}

function cycle_array(arr) {
  arr.push(arr.shift());
  return arr;
}

function select_keys(m, keys) {
  return keys.reduce((all, key) => {
    all[key] = m[key];
    return all;
  }, {});
}

function relative_add(x) {
  return "+=" + x;
}
