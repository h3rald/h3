"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.h = exports.VNode = void 0;
var FlexibleElement = (function (_super) {
    __extends(FlexibleElement, _super);
    function FlexibleElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FlexibleElement;
}(HTMLElement));
var NodeVNodePair = (function () {
    function NodeVNodePair() {
    }
    return NodeVNodePair;
}());
var selectorRegex = /^([a-z][a-z0-9:_=-]*)?(#[a-z0-9:_=-]+)?(\.[^ ]+)*$/i;
var $onrenderCallbacks = [];
var checkProperties = function (obj1, obj2) {
    for (var key in obj1) {
        if (!(key in obj2)) {
            return false;
        }
        if (!equal(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
};
var equal = function (obj1, obj2) {
    if ((obj1 === null && obj2 === null) ||
        (obj1 === undefined && obj2 === undefined)) {
        return true;
    }
    if ((obj1 === undefined && obj2 !== undefined) ||
        (obj1 !== undefined && obj2 === undefined) ||
        (obj1 === null && obj2 !== null) ||
        (obj1 !== null && obj2 === null)) {
        return false;
    }
    if (obj1.constructor !== obj2.constructor) {
        return false;
    }
    if (['string', 'number', 'boolean', 'function'].includes(typeof obj1)) {
        return obj1 === obj2;
    }
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (var i = 0; i < obj1.length; i++) {
            if (!equal(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }
    return checkProperties(obj1, obj2);
};
var VNode = (function () {
    function VNode(el, props) {
        var children = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            children[_i - 2] = arguments[_i];
        }
        this.props = {};
        this.data = {};
        this.children = [];
        this.classList = [];
        this.eventListeners = {};
        if (!props && !children) {
            if (typeof el === 'string') {
                this.processSelector(el);
            }
            else if (typeof el === 'function' ||
                (typeof el === 'object' && el !== null)) {
                if (el instanceof VNode && el.type === '#text') {
                    this.type = '#text';
                    this.value = el.value;
                }
                else {
                    this.from(el);
                }
            }
            else {
                throw new Error('[VNode] Invalid first argument passed to VNode constructor.');
            }
        }
        else if (!(props && children) && (props || children)) {
            if (typeof el !== 'string') {
                throw new Error('[VNode] Invalid first argument passed to VNode constructor.');
            }
            this.processSelector(el);
            if (!props && typeof children === 'string') {
                this.children = [new VNode({ type: '#text', value: children })];
                return;
            }
            if (!children &&
                typeof props !== 'function' &&
                (typeof props !== 'object' || props === null)) {
                throw new Error('[VNode] The second argument of a VNode constructor must be an object, an array or a string.');
            }
            if (!props) {
                this.processChildren(children);
            }
            else {
                this.processProperties(props);
            }
        }
        else if (el && props && children) {
            if (typeof el !== 'string') {
                throw new Error('[VNode] Invalid first argument passed to VNode constructor.');
            }
            this.processSelector(el);
            if (typeof props !== 'object' || props === null) {
                throw new Error('[VNode] Invalid second argument passed to VNode constructor.');
            }
            this.processProperties(props);
            this.processChildren(children);
        }
        else {
            throw new Error('[VNode] Too many arguments passed to VNode constructor.');
        }
    }
    VNode.prototype.from = function (data) {
        this.value = data.value;
        this.type = data.type;
        this.id = data.id;
        this.$html = data.$html;
        this.$onrender = data.$onrender;
        this.style = data.style;
        this.data = data.data;
        this.value = data.value;
        this.eventListeners = data.eventListeners;
        this.children = data.children;
        this.props = data.props;
        this.classList = data.classList;
    };
    VNode.prototype.equal = function (a, b) {
        return equal(a, b === undefined ? this : b);
    };
    VNode.prototype.processProperties = function (props) {
        var _this = this;
        this.id = this.id || props.id;
        this.$html = props.$html;
        this.$onrender = props.$onrender;
        this.style = props.style;
        this.value = props.value;
        this.data = (props.data || {});
        var classList = props.classList;
        this.classList =
            classList && classList.length > 0 ? classList : this.classList;
        this.props = props;
        Object.keys(props)
            .filter(function (a) { return a.startsWith('on') && props[a]; })
            .forEach(function (key) {
            if (typeof props[key] !== 'function') {
                throw new Error("[VNode] Event handler specified for " + key + " event is not a function.");
            }
            _this.eventListeners[key.slice(2)] = props[key];
            delete _this.props[key];
        });
        delete this.props.value;
        delete this.props.$html;
        delete this.props.$onrender;
        delete this.props.id;
        delete this.props.data;
        delete this.props.style;
        delete this.props.classList;
    };
    VNode.prototype.processSelector = function (selector) {
        if (!selector.match(selectorRegex)) {
            throw new Error("[VNode] Invalid selector: " + selector);
        }
        var _a = __read(selector.match(selectorRegex), 4), type = _a[1], id = _a[2], classes = _a[3];
        this.type = type;
        if (id) {
            this.id = id.slice(1);
        }
        this.classList = (classes && classes.split('.').slice(1)) || [];
    };
    VNode.prototype.processComponent = function (arg) {
        var vnode = arg();
        if (typeof vnode === 'string') {
            vnode = new VNode({ type: '#text', value: vnode });
        }
        if (!(vnode instanceof VNode)) {
            throw new Error('[VNode] Function argument does not return a VNode');
        }
        return vnode;
    };
    VNode.prototype.processChild = function (arg) {
        if (typeof arg === 'string') {
            return new VNode({ type: '#text', value: arg });
        }
        if (typeof arg === 'function') {
            return this.processComponent(arg);
        }
        else if (typeof arg === 'object' &&
            arg !== null &&
            arg instanceof VNode) {
            return arg;
        }
        if (arg) {
            throw new Error("[VNode] Specified child is not a VNode: " + arg);
        }
    };
    VNode.prototype.processChildren = function (arg) {
        this.children = arg.map(this.processChild).filter(function (c) { return c; });
    };
    VNode.prototype.render = function () {
        var _this = this;
        if (this.type === '#text') {
            return document.createTextNode(this.value);
        }
        var node = document.createElement(this.type);
        if (this.id) {
            node.id = this.id;
        }
        Object.keys(this.props).forEach(function (attr) {
            if (_this.props[attr] && typeof _this.props[attr] === 'string') {
                var a = document.createAttribute(attr);
                a.value = _this.props[attr];
                node.setAttributeNode(a);
            }
            if (typeof _this.props[attr] !== 'string' || !node[attr]) {
                node[attr] = _this.props[attr];
            }
        });
        Object.keys(this.eventListeners).forEach(function (event) {
            node.addEventListener(event, _this.eventListeners[event]);
        });
        if (this.value) {
            node.value = this.value;
        }
        if (this.style) {
            node.style.cssText = this.style;
        }
        this.classList.forEach(function (c) {
            node.classList.add(c);
        });
        Object.keys(this.data).forEach(function (key) {
            node.dataset[key] = _this.data[key];
        });
        this.children.forEach(function (c) {
            var cnode = c.render();
            node.appendChild(cnode);
            c.$onrender && $onrenderCallbacks.push(function () { return c.$onrender(cnode); });
        });
        if (this.$html) {
            node.innerHTML = this.$html;
        }
        return node;
    };
    VNode.prototype.redraw = function (data) {
        var e_1, _a;
        var node = data.node, vnode = data.vnode;
        var newvnode = vnode;
        var oldvnode = this;
        if (oldvnode.constructor !== newvnode.constructor ||
            oldvnode.type !== newvnode.type ||
            (oldvnode.type === newvnode.type &&
                oldvnode.type === '#text' &&
                oldvnode !== newvnode)) {
            var renderedNode = newvnode.render();
            node.parentNode.replaceChild(renderedNode, node);
            newvnode.$onrender && newvnode.$onrender(renderedNode);
            oldvnode.from(newvnode);
            return;
        }
        if (oldvnode.id !== newvnode.id) {
            node.id = newvnode.id || '';
            oldvnode.id = newvnode.id;
        }
        if (oldvnode.value !== newvnode.value) {
            node.value = newvnode.value || '';
            oldvnode.value = newvnode.value;
        }
        if (!equal(oldvnode.classList, newvnode.classList)) {
            oldvnode.classList.forEach(function (c) {
                if (!newvnode.classList.includes(c)) {
                    node.classList.remove(c);
                }
            });
            newvnode.classList.forEach(function (c) {
                if (!oldvnode.classList.includes(c)) {
                    node.classList.add(c);
                }
            });
            oldvnode.classList = newvnode.classList;
        }
        if (oldvnode.style !== newvnode.style) {
            node.style.cssText = newvnode.style || '';
            oldvnode.style = newvnode.style;
        }
        if (!equal(oldvnode.data, newvnode.data)) {
            Object.keys(oldvnode.data).forEach(function (a) {
                if (!newvnode.data[a]) {
                    delete node.dataset[a];
                }
                else if (newvnode.data[a] !== oldvnode.data[a]) {
                    node.dataset[a] = newvnode.data[a];
                }
            });
            Object.keys(newvnode.data).forEach(function (a) {
                if (!oldvnode.data[a]) {
                    node.dataset[a] = newvnode.data[a];
                }
            });
            oldvnode.data = newvnode.data;
        }
        if (!equal(oldvnode.props, newvnode.props)) {
            Object.keys(oldvnode.props).forEach(function (a) {
                if (newvnode.props[a] === false) {
                    node[a] = false;
                }
                if (!newvnode.props[a]) {
                    node.removeAttribute(a);
                }
                else if (newvnode.props[a] &&
                    newvnode.props[a] !== oldvnode.props[a]) {
                    node.setAttribute(a, newvnode.props[a]);
                }
            });
            Object.keys(newvnode.props).forEach(function (a) {
                if (!oldvnode.props[a] && newvnode.props[a]) {
                    node.setAttribute(a, newvnode.props[a]);
                }
            });
            oldvnode.props = newvnode.props;
        }
        if (!equal(oldvnode.eventListeners, newvnode.eventListeners)) {
            Object.keys(oldvnode.eventListeners).forEach(function (a) {
                if (!newvnode.eventListeners[a]) {
                    node.removeEventListener(a, oldvnode.eventListeners[a]);
                }
                else if (!equal(newvnode.eventListeners[a], oldvnode.eventListeners[a])) {
                    node.removeEventListener(a, oldvnode.eventListeners[a]);
                    node.addEventListener(a, newvnode.eventListeners[a]);
                }
            });
            Object.keys(newvnode.eventListeners).forEach(function (a) {
                if (!oldvnode.eventListeners[a]) {
                    node.addEventListener(a, newvnode.eventListeners[a]);
                }
            });
            oldvnode.eventListeners = newvnode.eventListeners;
        }
        function mapChildren(oldvnode, newvnode) {
            var map = [];
            var oldNodesFound = 0;
            var newNodesFound = 0;
            for (var oldIndex = 0; oldIndex < oldvnode.children.length; oldIndex++) {
                var found = -1;
                for (var index = 0; index < newvnode.children.length; index++) {
                    if (equal(oldvnode.children[oldIndex], newvnode.children[index]) &&
                        !map.includes(index)) {
                        found = index;
                        newNodesFound++;
                        oldNodesFound++;
                        break;
                    }
                }
                map.push(found);
            }
            if (newNodesFound === oldNodesFound &&
                newvnode.children.length === oldvnode.children.length) {
                return map;
            }
            if (newNodesFound === newvnode.children.length) {
                for (var i = 0; i < map.length; i++) {
                    if (map[i] === -1) {
                        map[i] = -3;
                    }
                }
            }
            if (oldNodesFound === oldvnode.children.length) {
                for (var newIndex = 0; newIndex < newvnode.children.length; newIndex++) {
                    if (!map.includes(newIndex)) {
                        map.splice(newIndex, 0, -2);
                    }
                }
            }
            if (newvnode.children.length < oldvnode.children.length) {
                for (var i = 0; i < map.length; i++) {
                    if (map[i] === -1 && !newvnode.children[i]) {
                        map[i] = -3;
                    }
                }
            }
            return map;
        }
        var childMap = mapChildren(oldvnode, newvnode);
        var resultMap = __spread(Array(childMap.filter(function (i) { return i !== -3; }).length).keys());
        while (!equal(childMap, resultMap)) {
            var count = -1;
            try {
                for (var childMap_1 = (e_1 = void 0, __values(childMap)), childMap_1_1 = childMap_1.next(); !childMap_1_1.done; childMap_1_1 = childMap_1.next()) {
                    var i = childMap_1_1.value;
                    count++;
                    var breakFor = false;
                    if (i === count) {
                        continue;
                    }
                    switch (i) {
                        case -1:
                            oldvnode.children[count].redraw({
                                node: node.childNodes[count],
                                vnode: newvnode.children[count]
                            });
                            break;
                        case -2:
                            oldvnode.children.splice(count, 0, newvnode.children[count]);
                            var renderedNode = newvnode.children[count].render();
                            node.insertBefore(renderedNode, node.childNodes[count]);
                            newvnode.children[count].$onrender &&
                                newvnode.children[count].$onrender(renderedNode);
                            breakFor = true;
                            break;
                        case -3:
                            oldvnode.children.splice(count, 1);
                            node.removeChild(node.childNodes[count]);
                            breakFor = true;
                            break;
                        default:
                            var vtarget = oldvnode.children.splice(i, 1)[0];
                            oldvnode.children.splice(count, 0, vtarget);
                            node.insertBefore(node.childNodes[i], node.childNodes[count]);
                            breakFor = true;
                            break;
                    }
                    if (breakFor) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (childMap_1_1 && !childMap_1_1.done && (_a = childMap_1.return)) _a.call(childMap_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            childMap = mapChildren(oldvnode, newvnode);
            resultMap = __spread(Array(childMap.length).keys());
        }
        if (!equal(oldvnode.$onrender, newvnode.$onrender)) {
            oldvnode.$onrender = newvnode.$onrender;
        }
        if (oldvnode.$html !== newvnode.$html) {
            node.innerHTML = newvnode.$html;
            oldvnode.$html = newvnode.$html;
            oldvnode.$onrender && oldvnode.$onrender(node);
        }
    };
    return VNode;
}());
exports.VNode = VNode;
exports.h = function (el, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return new (VNode.bind.apply(VNode, __spread([void 0, el, props], children)))();
};
exports.update = function (oldvnode, newvnode) {
    if (oldvnode instanceof VNode) {
        oldvnode.redraw({ node: oldvnode.element, vnode: newvnode });
        return oldvnode;
    }
    else {
        newvnode.element = newvnode.render();
        oldvnode.parentNode.replaceChild(oldvnode, newvnode.element);
        return newvnode;
    }
};
//# sourceMappingURL=vdom.js.map