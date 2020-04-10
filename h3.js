// Basic object equality
export const equal = (obj1, obj2) => {
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
}

/**
 * Creates an updatable region within a page, identified by a unique ID.
 * @param {Function} builder A function returning a VNode object.
 * @returns {Array[Element, Function]} The DOM element resulting by rendering the built VNode and a function used to update (rebuild) the element.
 */
export const region = (builder) => {
  const vnode = builder();
  if (!vnode.id) {
    throw 'No ID specified for region VNode.';
  }
  return [vnode.render(), () => vnode.update(builder())];
}
/**
 * Mounts a VNode and renders it as a child of an existing DOM Element.
 * @param {string} id A unique ID of of an existing DOM Element. 
 * @param {VNode} vnode The VNode to mount as child of the specified DOM element.
 */
export const mount = (id, vnode) => {
  document.getElementById(id).appendChild(vnode.render());
}

// Virtual Node Implementation with HyperScript-like syntax
export class VNode {
  constructor(...args) {
    this.element = null;
    this.attributes = {};
    this.children = [];
    this.classList = [];
    if (
      args[0] &&
      Object.prototype.toString.call(args[0]) === "[object Object]" &&
      !args[1] &&
      !args[2]
    ) {
      this.type = args[0].type;
      this.value = args[0].value;
    } else {
      this.type = "element";
      const elSelector = String(args[0]);
      if (args[1] && !args[2]) {
        // assuming no attributes
        if (args[1].constructor === Array) {
          this.children = args[1];
        } else {
          this.attributes = args[1];
        }
      } else {
        this.attributes = args[1] || {};
        this.children = args[2] || [];
      }
      const selectorRegex = /^([a-z0-9:_-]+)(#[a-z0-9:_-]+)?(\..+)?$/i
      const [, element, id, classes] = elSelector.match(selectorRegex);
      this.element = element;
      this.id = id && id.slice(1);
      this.classList = classes && classes.split('.').slice(1) || [];
      this.children = this.children.map((c) =>
        typeof c === "string" ? new VNode({ type: "text", value: c }) : c
      );
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
      node = document.getElementById(this.id)
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

export default function (...args) {
  return new VNode(...args);
}
