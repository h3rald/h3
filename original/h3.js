/**
 * H3 v0.10.0 "Jittery Jem'Hadar"
 * Copyright 2020 Fabio Cevasco <h3rald@h3rald.com>
 *
 * @license MIT
 * For the full license, see: https://github.com/h3rald/h3/blob/master/LICENSE
 */

class Route {
  constructor({ path, def, query, parts }) {
    this.path = path;
    this.def = def;
    this.query = query;
    this.parts = parts;
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
  constructor({ element, routes, store, location }) {
    this.element = element;
    this.redraw = null;
    this.store = store;
    this.location = location || window.location;
    if (!routes || Object.keys(routes).length === 0) {
      throw new Error("[Router] No routes defined.");
    }
    const defs = Object.keys(routes);
    this.routes = routes;
  }

  setRedraw(vnode, state) {
    this.redraw = () => {
      vnode.redraw({
        node: this.element.childNodes[0],
        vnode: this.routes[this.route.def](state),
      });
      this.store.dispatch("$redraw");
    };
  }

  async start() {
    const processPath = async (data) => {
      const oldRoute = this.route;
      const fragment =
        (data &&
          data.newURL &&
          data.newURL.match(/(#.+)$/) &&
          data.newURL.match(/(#.+)$/)[1]) ||
        this.location.hash;
      const path = fragment.replace(/\?.+$/, "").slice(1);
      const rawQuery = fragment.match(/\?(.+)$/);
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
          this.route = new Route({ query, path, def, parts });
          break;
        }
      }
      if (!this.route) {
        throw new Error(`[Router] No route matches '${fragment}'`);
      }
      // Old route component teardown
      if (oldRoute) {
        const oldRouteComponent = this.routes[oldRoute.def];
        oldRouteComponent.state =
          oldRouteComponent.teardown &&
          (await oldRouteComponent.teardown(oldRouteComponent.state));
      }
      // New route component setup
      const newRouteComponent = this.routes[this.route.def];
      newRouteComponent.state = {};
      newRouteComponent.setup &&
        (await newRouteComponent.setup(newRouteComponent.state));
      // Redrawing...
      redrawing = true;
      this.store.dispatch("$navigation", this.route);
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
      const vnode = newRouteComponent(newRouteComponent.state);
      const node = vnode.render();
      this.element.appendChild(node);
      this.setRedraw(vnode, newRouteComponent.state);
      redrawing = false;
      vnode.$onrender && vnode.$onrender(node);
      $onrenderCallbacks.forEach((cbk) => cbk());
      $onrenderCallbacks = [];
      window.scrollTo(0, 0);
      this.store.dispatch("$redraw");
    };
    window.addEventListener("hashchange", processPath);
    await processPath();
  }

  navigateTo(path, params) {
    let query = Object.keys(params || {})
      .map((p) => `${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`)
      .join("&");
    query = query ? `?${query}` : "";
    this.location.hash = `#${path}${query}`;
  }
}

// High Level API
const h3 = (...args) => {
  return new VNode(...args);
};

let store = null;
let router = null;
let redrawing = false;

h3.init = (config) => {
  let { element, routes, modules, preStart, postStart, location } = config;
  if (!routes) {
    // Assume config is a component object, define default route
    if (typeof config !== "function") {
      throw new Error(
        "[h3.init] The specified argument is not a valid configuration object or component function"
      );
    }
    routes = { "/": config };
  }
  element = element || document.body;
  if (!(element && element instanceof Element)) {
    throw new Error("[h3.init] Invalid element specified.");
  }
  // Initialize store
  store = new Store();
  (modules || []).forEach((i) => {
    i(store);
  });
  store.dispatch("$init");
  // Initialize router
  router = new Router({ element, routes, store, location });
  return Promise.resolve(preStart && preStart())
    .then(() => router.start())
    .then(() => postStart && postStart());
};

h3.navigateTo = (path, params) => {
  if (!router) {
    throw new Error(
      "[h3.navigateTo] No application initialized, unable to navigate."
    );
  }
  return router.navigateTo(path, params);
};

Object.defineProperty(h3, "route", {
  get: () => {
    if (!router) {
      throw new Error(
        "[h3.route] No application initialized, unable to retrieve current route."
      );
    }
    return router.route;
  },
});

Object.defineProperty(h3, "state", {
  get: () => {
    if (!store) {
      throw new Error(
        "[h3.state] No application initialized, unable to retrieve current state."
      );
    }
    return store.state;
  },
});

h3.on = (event, cb) => {
  if (!store) {
    throw new Error(
      "[h3.on] No application initialized, unable to listen to events."
    );
  }
  return store.on(event, cb);
};

h3.dispatch = (event, data) => {
  if (!store) {
    throw new Error(
      "[h3.dispatch] No application initialized, unable to dispatch events."
    );
  }
  return store.dispatch(event, data);
};

h3.redraw = (setRedrawing) => {
  if (!router || !router.redraw) {
    throw new Error(
      "[h3.redraw] No application initialized, unable to redraw."
    );
  }
  if (redrawing) {
    return;
  }
  redrawing = true;
  router.redraw();
  redrawing = setRedrawing || false;
};

export default h3;
