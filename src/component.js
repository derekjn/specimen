export function pack(component, ids = {}) {
  if (component.children) {
    Object.entries(component.children).forEach(([ name, sub ]) => {
      if (Array.isArray(sub)) {
        sub.forEach((s, i) => {
          ids = { ...ids, ...pack(s, ids) };
          component.children[name][i] = s.id;
        });
      } else {
        ids = { ...ids, ...pack(sub, ids) };
        component.children[name] = sub.id;
      }
    });
  }
  
  ids[component.id] = component;
  return ids;
}
