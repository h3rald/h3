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
                this.params[decodeURIComponent(name)] = decodeURIComponent(
                    value
                );
            });
        }
    }
}

export class Router {
    constructor({ element, routes, store, location, $onrenderCallbacks }) {
        if (!routes || Object.keys(routes).length === 0) {
            throw new Error("[Router] No routes defined.");
        }
        this.element = element || document.body;
        this.routes = routes;
        this.redraw = null;
        this.redrawing = false;
        this.store = store;
        this.$onrenderCallbacks = $onrenderCallbacks;
        this.location = location || window.location;
    }

    setRedraw(vnode, state) {
        this.redraw = () => {
            vnode.redraw({
                node: this.element.childNodes[0],
                vnode: this.routes[this.route.def](state),
            });
            this.store && this.store.dispatch("$redraw");
        };
    }

    async processPath(event) {
        const oldRoute = this.route;
        const fragment =
            (event &&
                event.newURL &&
                event.newURL.match(/(#.+)$/) &&
                event.newURL.match(/(#.+)$/)[1]) ||
            this.location.hash;
        const path = fragment.replace(/\?.+$/, "").slice(1);
        const rawQuery = fragment.match(/\?(.+)$/);
        const query = rawQuery && rawQuery[1] ? rawQuery[1] : "";
        const pathParts = path.split("/").slice(1);
        let parts = {};
        this.route = null;
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
            this.route = oldRoute;
            return; // Halt navigation;
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
        this.redrawing = true;
        this.store && this.store.dispatch("$navigation", this.route);
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        const vnode = newRouteComponent(newRouteComponent.state);
        const node = vnode.render();
        this.element.appendChild(node);
        this.setRedraw(vnode, newRouteComponent.state);
        this.redrawing = false;
        vnode.$onrender && vnode.$onrender(node);
        if (this.$onrenderCallbacks) {
            this.$onrenderCallbacks.forEach((cbk) => cbk());
            this.$onrenderCallbacks.length = 0;
        }
        window.scrollTo(0, 0);
        this.store && this.store.dispatch("$redraw");
    }

    async start() {
        window.addEventListener("hashchange", (e) => this.processPath(e));
        await this.processPath();
    }

    navigateTo(path, params) {
        let query = Object.keys(params || {})
            .map(
                (p) =>
                    `${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`
            )
            .join("&");
        query = query ? `?${query}` : "";
        this.location.hash = `#${path}${query}`;
    }
}
