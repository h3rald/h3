// Basic object equality
const equal = (obj1, obj2) => {
  if (
    (obj1 === null && obj2 === null) ||
    (obj1 === undefined && obj2 === undefined)
  ) {
    return true;
  }
  if (
    (obj1 === undefined && obj2 !== undefined) ||
    (obj1 !== undefined && obj2 === undefined) ||
    (obj1 === null && obj2 !== null) ||
    (obj1 !== null && obj2 === null)
  ) {
    return false;
  }
  if (obj1.constructor !== obj2.constructor) {
    return false;
  }
  if (typeof obj1 === "function") {
    if (obj1.toString() !== obj2.toString()) {
      return false;
    }
  }
  if ([String, Number, Boolean].includes(obj1.constructor)) {
    if (obj1 !== obj2) {
    }
    return obj1 === obj2;
  }
  if (obj1.constructor === Array) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!equal(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }
  const o1 = obj1 || {};
  const o2 = obj2 || {};
  function checkProperties(obj1, obj2) {
    for (const key in obj1) {
      if (!(key in obj2)) {
        return false;
      }
      if (!equal(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }
  return checkProperties(o1, o2) && checkProperties(o2, o1);
};

// Virtual Node Implementation with HyperScript-like syntax
class VNode {

  from(data) {
    this.type = data.type;
    this.value = data.value;
    this.element = data.value;
    this.id = data.id;
    this.children = data.children;
    this.attributes = data.attributes;
    this.classList = data.classList;
  }

  constructor(...args) {
    this.element = null;
    this.attributes = {};
    this.children = [];
    this.classList = [];
    if (typeof args[0] !== 'string' && !args[1] && !args[2]) {
      if (Object.prototype.toString.call(args[0]) === "[object Object]") {
        if (args[0] instanceof VNode) {
          this.from(args[0]); 
          return
        } else {
          this.type = args[0].type;
          this.value = args[0].value;
          return
        }
      } else if (typeof args[0] === "function") {
        const vnode = args[0]();
        this.from(vnode);
        return;
      }
    } else {
      this.type = "element";
      const elSelector = String(args[0]);
      if (args[1] && !args[2]) {
        // assuming no attributes
        if (typeof args[1] === "string") {
          this.children = [args[1]];
        } else if (args[1].constructor === Array) {
          this.children = args[1];
        } else {
          this.attributes = args[1];
        }
      } else {
        this.attributes = args[1] || {};
        this.children = typeof args[2] === "string" ? [args[2]] : args[2] || [];
      }
      const selectorRegex = /^([a-z0-9:_-]+)(#[a-z0-9:_-]+)?(\..+)?$/i;
      const [, element, id, classes] = elSelector.match(selectorRegex);
      this.element = element;
      this.id = id && id.slice(1);
      this.classList = (classes && classes.split(".").slice(1)) || [];
      this.children = this.children.map((c) => {
        if (typeof c === "string") {
          return new VNode({ type: "text", value: c });
        } else if (typeof c === "function") {
          return new VNode(c);
        } else {
          return c;
        }
      });
    }
  }

  // Renders the actual DOM Node corresponding to the current Virtual Node
  render() {
    if (this.type === "text") {
      return document.createTextNode(this.value);
    }
    const node = document.createElement(this.element);
    if (this.id) {
      node.id = this.id;
    }
    Object.keys(this.attributes).forEach((attr) => {
      if (attr.match(/^on/)) {
        // Event listener
        const event = attr.match(/^on(.+)$/)[1];
        node.addEventListener(event, this.attributes[attr]);
      } else if (attr === "value") {
        node.value = this.attributes[attr];
      } else {
        // Standard attributes
        const a = document.createAttribute(attr);
        a.value = this.attributes[attr];
        node.setAttributeNode(a);
      }
    });
    // Classes
    this.classList.forEach((c) => {
      node.classList.add(c);
    });
    // Children
    this.children.forEach((c) => {
      node.appendChild(c.render());
    });
    return node;
  }

  // Updates the current Virtual Node with a new Virtual Node (and syncs the existing DOM Node)
  update(data) {
    let { node, vnode } = data || {};
    if (!node && this.id) {
      node = document.getElementById(this.id);
    }
    if (!vnode) {
      vnode = this.render();
    }
    const newvnode = vnode;
    const oldvnode = this;
    if (
      oldvnode.constructor !== newvnode.constructor ||
      oldvnode.element !== newvnode.element
    ) {
      // Different node types, replace the whole node (requires valid parent node)
      node.parentNode.replaceChild(newvnode.render(), node);
      oldvnode = newvnode;
      return;
    } else if (oldvnode.constructor === String && oldvnode !== newvnode) {
      // String nodes, update value
      node.data = newvnode;
      oldvnode = newvnode;
      return;
    }
    if (!equal(oldvnode.classList, newvnode.classList)) {
      oldvnode.classList.forEach((c) => {
        if (!newvnode.classList.includes(c)) {
          node.classList.remove(c);
        }
      });
      newvnode.classList.forEach((c) => {
        if (!oldvnode.classList.includes(c)) {
          node.classList.add(c);
        }
      });
      oldvnode.classList = newvnode.classList;
    }
    if (!equal(oldvnode.attributes, newvnode.attributes)) {
      Object.keys(oldvnode.attributes).forEach((a) => {
        if (!newvnode.attributes[a]) {
          node.removeAttribute(a);
        } else if (newvnode.attributes[a] !== oldvnode.attributes[a]) {
          node.setAttribute(a, newvnode.attributes[a]);
        }
      });
      Object.keys(newvnode.attributes).forEach((a) => {
        if (!oldvnode.attributes[a]) {
          node.setAttribute(a, newvnode.attributes[a]);
        }
      });
      oldvnode.attributes = newvnode.attributes;
    }
    var newmap = []; // Map positions of newvnode children in relation to oldvnode children
    var oldmap = []; // Map positions of oldvnode children in relation to newvnode children
    if (newvnode.children) {
      function mapChildren(parent1, parent2) {
        const map = [];
        for (let j = 0; j < parent1.children.length; j++) {
          let found = false;
          for (let k = 0; k < parent2.children.length; k++) {
            if (equal(parent1.children[j], parent2.children[k])) {
              map.push(k);
              found = true;
              break;
            }
          }
          // node not in oldvnode
          if (!found) {
            map.push(-1);
          }
        }
        return map;
      }
      var newmap = mapChildren(newvnode, oldvnode);
      var oldmap = mapChildren(oldvnode, newvnode);
      var notFoundInOld = newmap.indexOf(-1);
      var notFoundInNew = oldmap.indexOf(-1);
      if (equal(newmap, oldmap) && (notFoundInNew >= 0 || notFoundInOld >= 0)) {
        // Something changed
        for (let i = 0; i < newmap.length; i++) {
          if (newmap[i] === -1) {
            if (oldvnode.children[i].type === "text") {
              oldvnode.children[i] = newvnode.children[i];
              node.childNodes[i].nodeValue = newvnode.children[i].value;
            } else {
              oldvnode.children[i].update({
                node: node.childNodes[i],
                vnode: newvnode.children[i],
              });
            }
          }
        }
      } else {
        var notFoundInOld = newmap.indexOf(-1);
        var notFoundInNew = oldmap.indexOf(-1);
        while (notFoundInOld >= 0 || notFoundInNew >= 0) {
          // First remove children not found in new map, then add the missing ones.
          if (notFoundInNew >= 0) {
            // while there are children not found in newvnode, remove them and re-check
            node.removeChild(node.childNodes[notFoundInNew]);
            oldvnode.children.splice(notFoundInNew, 1);
            newmap = mapChildren(newvnode, oldvnode);
            oldmap = mapChildren(oldvnode, newvnode);
            notFoundInNew = oldmap.indexOf(-1);
            notFoundInOld = newmap.indexOf(-1);
          }
          if (notFoundInOld >= 0) {
            // while there are children not found in oldvnode, add them and re-check
            node.insertBefore(
              newvnode.children[notFoundInOld].render(),
              node.childNodes[notFoundInOld]
            );
            oldvnode.children.splice(
              notFoundInOld,
              0,
              newvnode.children[notFoundInOld]
            );
            newmap = mapChildren(newvnode, oldvnode);
            oldmap = mapChildren(oldvnode, newvnode);
            notFoundInNew = oldmap.indexOf(-1);
            notFoundInOld = newmap.indexOf(-1);
          }
        }
      }
    }
  }
}

// Simple store based on Storeon
// https://github.com/storeon/storeon/blob/master/index.js
class Store {
  constructor() {
    this.events = {};
    this.state = {};
  }
  dispatch(event, data) {
    if (this.events[event]) {
      if (event !== "log") this.dispatch("log", { event, data });
      let changes = {};
      let changed;
      this.events[event].forEach((i) => {
        this.state = { ...this.state, ...i(this.state, data) };
      });
    }
  }

  get(arg) {
    return arg ? this.state[arg] : this.state;
  }

  on(event, cb) {
    (this.events[event] || (this.events[event] = [])).push(cb);

    return () => {
      this.events[event] = this.events[event].filter((i) => i !== cb);
    };
  }
}

const createStore = (modules) => {
  const store = new Store();

  modules.forEach((i) => {
    if (i) i(store);
  });

  return store;
};

class Route {
  constructor({ path, def, query, parts, fallback }) {
    this.path = path;
    this.def = def;
    this.query = query;
    this.parts = parts;
    this.fallback = fallback;
    this.params = {};
    if (this.query) {
      const rawParams = this.query.split("&");
      rawParams.forEach((p) => {
        const [name, value] = p.split("=");
        this.params[decodeURIComponent(name)] = decodeURIComponent(value);
      });
    }
  }
}

class Router {
  constructor({element, routes }) {
    this.element = element;
    if (!this.element) {
      throw new Error(
        `[Router] No view element specified.`
      );
    }
    if (!routes || Object.keys(routes).length === 0) {
      throw new Error("[Router] No routes defined.");
    }
    const defs = Object.keys(routes);
    this.fallback = defs[defs.length-1];
    this.routes = routes;
  }

  start() {
    const processPath = () => {
      const path = window.location.hash.replace(/\?.+$/, "").slice(1);
      const rawQuery = window.location.hash.match(/\?(.+)$/);
      const query = rawQuery && rawQuery[1] ? rawQuery[1] : "";
      const pathParts = path.split("/").slice(1);
      let parts = {};
      for (let def of Object.keys(this.routes)) {
        let routeParts = def.split("/").slice(1);
        let match = true;
        let index = 0;
        parts = {};
        while (match && routeParts[index]) {
          const rP = routeParts[index];
          const pP = pathParts[index];
          if (rP.startsWith(":") && pP) {
            parts[rP.slice(1)] = pP;
          } else {
            match = rP === pP;
          }
          index++;
        }
        if (match) {
          let fallback = false;
          this.route = new Route({ query, path, def, parts, fallback });
        }
      }
      if (!this.route) {
        let def = this.fallback;
        let fallback = true;
        this.route = new Route({ query, path, def, parts, fallback });
      }
      // Display View
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
      this.element.appendChild(this.routes[this.route.def].render());
    };
    processPath();
    window.addEventListener("hashchange", processPath);
  }

  go(path, params) {
    let query = Object.keys(params)
      .map((p) => `${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`)
      .join("&");
    query = query ? `?${query}` : "";
    window.location.hash = `#${path}${query}`;
  }
}

// High Level API

const h3 = (...args) => {
  return new VNode(...args);
};

let store = null;
let router = null;
let updateFn = null;
let vnode = null;

h3.init = ({element, routes, modules, component}) => {
  if (!(element instanceof Element)) {
    throw new Error('Invalid element specified.');
  }
  // Initialize store
  store = new Store();
  (modules || []).forEach((i) => {
    if (i) i(store);
  });
  store.dispatch("$init");
  // Initialize component
  vnode = component();
  updateFn = () => {
    vnode.update({vnode: component()});
  }
  // Initialize router
  //router = new Router({element, routes})
  // Render
  //router.start();
  store.on('$update', updateFn);
  element.appendChild(vnode.render());
}

h3.go = (path, params) => {
  if (!router) {
    throw new Error('No application initialized, unable to navigate.');
  }
  return router.go(path, params);
}

h3.route = () => {
  if (!router) {
    throw new Error('No application initialized, unable to retrieve current route.');
  }
  return router.route;
}

h3.state = (key) => {
  if (!store) {
    throw new Error('No application initialized, unable to retrieve current state.');
  }
  return store.get(key);
}

h3.on = (event, cb) => {
  if (!store) {
    throw new Error('No application initialized, unable to listen to events.');
  }
  return store.on(event, cb);
}

h3.dispatch = (event, data) => {
  if (!store) {
    throw new Error('No application initialized, unable to dispatch events.');
  }
  return store.dispatch(event, data);
}

h3.update = () => {
  if (!updateFn) {
    throw new Error('No application initialized, unable to update.');
  }
  updateFn();
}

export default h3;
