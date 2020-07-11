type PropertyValue =
  | string
  | number
  | boolean
  | Function
  | Record<string, any>
  | Array<PropertyValue>;

type PropertyObject = Record<string, PropertyValue>;

class FlexibleElement extends HTMLElement {
  [key: string]: PropertyValue;
  value?: string;
}

class NodeVNodePair {
  node: FlexibleElement;
  vnode: VNode;
}

type OnRenderCallback = (node?: FlexibleElement | Text) => void;
type EventHandler = (e?: Event) => void;
type ComponentFunction = (...params: Array<PropertyValue>) => VNode;
interface VTextNode {
  type: string;
  value: string;
}
type VNodeLike = string | VNode | ComponentFunction | VTextNode;

const selectorRegex = /^([a-z][a-z0-9:_=-]*)?(#[a-z0-9:_=-]+)?(\.[^ ]+)*$/i;
let $onrenderCallbacks: Array<OnRenderCallback> = [];

const checkProperties = (
  obj1: PropertyObject,
  obj2: PropertyObject
): boolean => {
  for (const key in obj1) {
    if (!(key in obj2)) {
      return false;
    }
    if (!equal(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};

const equal = (obj1: PropertyValue, obj2: PropertyValue) => {
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
  if (['string', 'number', 'boolean', 'function'].includes(typeof obj1)) {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
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
  return checkProperties(obj1 as PropertyObject, obj2 as PropertyObject);
};

export class VNode {
  type: string;
  props: PropertyObject = {};
  data: PropertyObject = {};
  id: string;
  $html: string;
  $onrender: OnRenderCallback;
  style: string;
  element?: FlexibleElement
  value: string;
  children: Array<VNode> = [];
  classList: Array<string> = [];
  eventListeners: Record<string, EventHandler> = {};

  constructor(
    el: VNodeLike,
    props?: PropertyObject,
    ...children: Array<VNodeLike>
  ) {
    if (!props && !children) {
      if (typeof el === 'string') {
        // Assume empty element
        this.processSelector(el);
      } else if (
        typeof el === 'function' ||
        (typeof el === 'object' && el !== null)
      ) {
        // Text node
        if (el instanceof VNode && el.type === '#text') {
          this.type = '#text';
          this.value = el.value;
        } else {
          this.from(el as VNode);
        }
      } else {
        throw new Error(
          '[VNode] Invalid first argument passed to VNode constructor.'
        );
      }
    } else if (!(props && children) && (props || children)) {
      if (typeof el !== 'string') {
        throw new Error(
          '[VNode] Invalid first argument passed to VNode constructor.'
        );
      }
      this.processSelector(el);
      if (!props && typeof children === 'string') {
        // Assume single child text node
        this.children = [new VNode({ type: '#text', value: children })];
        return;
      }
      if (
        !children &&
        typeof props !== 'function' &&
        (typeof props !== 'object' || props === null)
      ) {
        throw new Error(
          '[VNode] The second argument of a VNode constructor must be an object, an array or a string.'
        );
      }
      if (!props) {
        // Assume 2nd argument as children
        this.processChildren(children);
      } else {
        // Not a VNode, assume props object
        this.processProperties(props);
      }
    } else if (el && props && children) {
      if (typeof el !== 'string') {
        throw new Error(
          '[VNode] Invalid first argument passed to VNode constructor.'
        );
      }
      this.processSelector(el);
      if (typeof props !== 'object' || props === null) {
        throw new Error(
          '[VNode] Invalid second argument passed to VNode constructor.'
        );
      }
      this.processProperties(props);
      this.processChildren(children);
    } else {
      throw new Error(
        '[VNode] Too many arguments passed to VNode constructor.'
      );
    }
  }

  from(data: VNode): void {
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
  }

  equal(a: PropertyValue, b?: PropertyValue): boolean {
    return equal(a, b === undefined ? this : b);
  }

  processProperties(props: PropertyObject) {
    this.id = this.id || (props.id as string);
    this.$html = props.$html as string;
    this.$onrender = props.$onrender as OnRenderCallback;
    this.style = props.style as string;
    this.value = props.value as string;
    this.data = (props.data || {}) as PropertyObject;
    const classList = props.classList as Array<string>;
    this.classList =
      classList && classList.length > 0 ? classList : this.classList;
    this.props = props;
    Object.keys(props)
      .filter((a) => a.startsWith('on') && props[a])
      .forEach((key) => {
        if (typeof props[key] !== 'function') {
          throw new Error(
            `[VNode] Event handler specified for ${key} event is not a function.`
          );
        }
        this.eventListeners[key.slice(2)] = props[key] as EventHandler;
        delete this.props[key];
      });
    delete this.props.value;
    delete this.props.$html;
    delete this.props.$onrender;
    delete this.props.id;
    delete this.props.data;
    delete this.props.style;
    delete this.props.classList;
  }

  processSelector(selector: string): void {
    if (!selector.match(selectorRegex)) {
      throw new Error(`[VNode] Invalid selector: ${selector}`);
    }
    const [, type, id, classes] = selector.match(selectorRegex);
    this.type = type;
    if (id) {
      this.id = id.slice(1);
    }
    this.classList = (classes && classes.split('.').slice(1)) || [];
  }

  processComponent(arg: ComponentFunction): VNode {
    let vnode = arg();
    if (typeof vnode === 'string') {
      vnode = new VNode({ type: '#text', value: vnode });
    }
    if (!(vnode instanceof VNode)) {
      throw new Error('[VNode] Function argument does not return a VNode');
    }
    return vnode;
  }

  processChild(arg: VNodeLike): VNode {
    if (typeof arg === 'string') {
      return new VNode({ type: '#text', value: arg });
    }
    if (typeof arg === 'function') {
      return this.processComponent(arg);
    } else if (
      typeof arg === 'object' &&
      arg !== null &&
      arg instanceof VNode
    ) {
      return arg;
    }
    if (arg) {
      throw new Error(`[VNode] Specified child is not a VNode: ${arg}`);
    }
  }

  processChildren(arg: Array<VNodeLike>): void {
    this.children = arg.map(this.processChild).filter((c) => c);
  }

  // Renders the actual DOM Node corresponding to the current Virtual Node
  render(): FlexibleElement | Text {
    if (this.type === '#text') {
      return document.createTextNode((this as VTextNode).value);
    }
    const node = document.createElement(this.type) as FlexibleElement;
    if (this.id) {
      node.id = this.id;
    }
    Object.keys(this.props).forEach((attr) => {
      // Set props (only if non-empty strings)
      if (this.props[attr] && typeof this.props[attr] === 'string') {
        const a = document.createAttribute(attr);
        a.value = this.props[attr] as string;
        node.setAttributeNode(a);
      }
      // Set properties
      if (typeof this.props[attr] !== 'string' || !node[attr]) {
        node[attr] = this.props[attr];
      }
    });
    // Event Listeners
    Object.keys(this.eventListeners).forEach((event) => {
      node.addEventListener(event, this.eventListeners[event]);
    });
    // Value
    if (this.value) {
      node.value = this.value as string;
    }
    // Style
    if (this.style) {
      node.style.cssText = this.style;
    }
    // Classes
    this.classList.forEach((c) => {
      node.classList.add(c);
    });
    // Data
    Object.keys(this.data).forEach((key) => {
      node.dataset[key] = this.data[key] as string;
    });
    // Children
    this.children.forEach((c) => {
      const cnode = c.render();
      node.appendChild(cnode);
      c.$onrender && $onrenderCallbacks.push(() => c.$onrender(cnode));
    });
    if (this.$html) {
      node.innerHTML = this.$html;
    }
    return node;
  }

  // Updates the current Virtual Node with a new Virtual Node (and syncs the existing DOM Node)
  redraw(data: NodeVNodePair): void {
    let { node, vnode } = data;
    const newvnode = vnode;
    const oldvnode = this;
    if (
      oldvnode.constructor !== newvnode.constructor ||
      oldvnode.type !== newvnode.type ||
      (oldvnode.type === newvnode.type &&
        oldvnode.type === '#text' &&
        oldvnode !== newvnode)
    ) {
      const renderedNode = newvnode.render();
      node.parentNode.replaceChild(renderedNode, node);
      newvnode.$onrender && newvnode.$onrender(renderedNode);
      oldvnode.from(newvnode);
      return;
    }
    // ID
    if (oldvnode.id !== newvnode.id) {
      node.id = newvnode.id || '';
      oldvnode.id = newvnode.id;
    }
    // Value
    if (oldvnode.value !== newvnode.value) {
      node.value = newvnode.value || '';
      oldvnode.value = newvnode.value;
    }
    // Classes
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
    // Style
    if (oldvnode.style !== newvnode.style) {
      node.style.cssText = newvnode.style || '';
      oldvnode.style = newvnode.style;
    }
    // Data
    if (!equal(oldvnode.data, newvnode.data)) {
      Object.keys(oldvnode.data).forEach((a) => {
        if (!newvnode.data[a]) {
          delete node.dataset[a];
        } else if (newvnode.data[a] !== oldvnode.data[a]) {
          node.dataset[a] = newvnode.data[a] as string;
        }
      });
      Object.keys(newvnode.data).forEach((a) => {
        if (!oldvnode.data[a]) {
          node.dataset[a] = newvnode.data[a] as string;
        }
      });
      oldvnode.data = newvnode.data;
    }
    // props
    if (!equal(oldvnode.props, newvnode.props)) {
      Object.keys(oldvnode.props).forEach((a) => {
        if (newvnode.props[a] === false) {
          node[a] = false;
        }
        if (!newvnode.props[a]) {
          node.removeAttribute(a);
        } else if (
          newvnode.props[a] &&
          newvnode.props[a] !== oldvnode.props[a]
        ) {
          node.setAttribute(a, newvnode.props[a] as string);
        }
      });
      Object.keys(newvnode.props).forEach((a) => {
        if (!oldvnode.props[a] && newvnode.props[a]) {
          node.setAttribute(a, newvnode.props[a] as string);
        }
      });
      oldvnode.props = newvnode.props;
    }
    // Event listeners
    if (!equal(oldvnode.eventListeners, newvnode.eventListeners)) {
      Object.keys(oldvnode.eventListeners).forEach((a) => {
        if (!newvnode.eventListeners[a]) {
          node.removeEventListener(a, oldvnode.eventListeners[a]);
        } else if (
          !equal(newvnode.eventListeners[a], oldvnode.eventListeners[a])
        ) {
          node.removeEventListener(a, oldvnode.eventListeners[a]);
          node.addEventListener(a, newvnode.eventListeners[a]);
        }
      });
      Object.keys(newvnode.eventListeners).forEach((a) => {
        if (!oldvnode.eventListeners[a]) {
          node.addEventListener(a, newvnode.eventListeners[a]);
        }
      });
      oldvnode.eventListeners = newvnode.eventListeners;
    }
    // Children
    function mapChildren(oldvnode: VNode, newvnode: VNode) {
      let map: Array<number> = [];
      let oldNodesFound = 0;
      let newNodesFound = 0;
      // First look for existing nodes
      for (let oldIndex = 0; oldIndex < oldvnode.children.length; oldIndex++) {
        let found = -1;
        for (let index = 0; index < newvnode.children.length; index++) {
          if (
            equal(oldvnode.children[oldIndex], newvnode.children[index]) &&
            !map.includes(index)
          ) {
            found = index;
            newNodesFound++;
            oldNodesFound++;
            break;
          }
        }
        map.push(found);
      }
      if (
        newNodesFound === oldNodesFound &&
        newvnode.children.length === oldvnode.children.length
      ) {
        // something changed but everything else is the same
        return map;
      }
      if (newNodesFound === newvnode.children.length) {
        // All children in newvnode exist in oldvnode
        // All nodes that are not found must be removed
        for (let i = 0; i < map.length; i++) {
          if (map[i] === -1) {
            map[i] = -3;
          }
        }
      }
      if (oldNodesFound === oldvnode.children.length) {
        // All children in oldvnode exist in newvnode
        // Check where the missing newvnodes children need to be added
        for (
          let newIndex = 0;
          newIndex < newvnode.children.length;
          newIndex++
        ) {
          if (!map.includes(newIndex)) {
            map.splice(newIndex, 0, -2);
          }
        }
      }
      // Check if nodes needs to be removed (if there are fewer children)
      if (newvnode.children.length < oldvnode.children.length) {
        for (let i = 0; i < map.length; i++) {
          if (map[i] === -1 && !newvnode.children[i]) {
            map[i] = -3;
          }
        }
      }
      return map;
    }
    let childMap = mapChildren(oldvnode, newvnode);
    let resultMap = [...Array(childMap.filter((i) => i !== -3).length).keys()];
    while (!equal(childMap, resultMap)) {
      let count = -1;
      for (let i of childMap) {
        count++;
        let breakFor = false;
        if (i === count) {
          // Matching nodes;
          continue;
        }
        switch (i) {
          case -1:
            // different node, check
            oldvnode.children[count].redraw({
              node: node.childNodes[count] as FlexibleElement,
              vnode: newvnode.children[count]
            });
            break;
          case -2:
            // add node
            oldvnode.children.splice(count, 0, newvnode.children[count]);
            const renderedNode = newvnode.children[count].render();
            node.insertBefore(renderedNode, node.childNodes[count]);
            newvnode.children[count].$onrender &&
              newvnode.children[count].$onrender(renderedNode);
            breakFor = true;
            break;
          case -3:
            // remove node
            oldvnode.children.splice(count, 1);
            node.removeChild(node.childNodes[count]);
            breakFor = true;
            break;
          default:
            // Node found, move nodes and remap
            const vtarget = oldvnode.children.splice(i, 1)[0];
            oldvnode.children.splice(count, 0, vtarget);
            node.insertBefore(node.childNodes[i], node.childNodes[count]);
            breakFor = true;
            break;
        }
        if (breakFor) {
          break;
        }
      }
      childMap = mapChildren(oldvnode, newvnode);
      resultMap = [...Array(childMap.length).keys()];
    }
    // $onrender
    if (!equal(oldvnode.$onrender, newvnode.$onrender)) {
      oldvnode.$onrender = newvnode.$onrender;
    }
    // innerHTML
    if (oldvnode.$html !== newvnode.$html) {
      node.innerHTML = newvnode.$html;
      oldvnode.$html = newvnode.$html;
      oldvnode.$onrender && oldvnode.$onrender(node);
    }
  }
}

export const h = (
  el: VNodeLike,
  props?: PropertyObject,
  ...children: Array<VNodeLike>
): VNode => {
  return new VNode(el, props, ...children);
};

export const update = (oldvnode: HTMLElement | VNode, newvnode?: VNode): VNode => {
  if (oldvnode instanceof VNode) {
    oldvnode.redraw({node: oldvnode.element, vnode: newvnode});
    return oldvnode;
  } else {
    // Firse time
    newvnode.element = newvnode.render() as FlexibleElement;
    (oldvnode as HTMLElement).parentNode.replaceChild(oldvnode, newvnode.element);
    return newvnode;
  }
}
