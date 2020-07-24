/**
 * H3 v0.10.0 "Jittery Jem'Hadar"
 * Copyright 2020 Fabio Cevasco <h3rald@h3rald.com>
 *
 * @license MIT
 * For the full license, see: https://github.com/h3rald/h3/blob/master/LICENSE
 */
import { Router } from "./router.js";
import { Store } from "./store.js";
export { h } from "./vdom.js";
import { settings, $onrenderCallbacks } from "./vdom";

/*** High Level API ***/
export const h3 = {};

settings.$onrenderCallbacks = true;
let store = null;
let router = null;

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
    router = new Router({
        element,
        routes,
        store,
        location,
        $onrenderCallbacks,
    });
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
    if (router.redrawing) {
        return;
    }
    router.redrawing = true;
    router.redraw();
    router.redrawing = setRedrawing || false;
};

export default h3;
