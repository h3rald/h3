// TODO: Rewrite
const h3 = require("../h3.js").default;

describe("h3", () => {

  it("should expose an equal method to check object/array/function equality", () => {
    expect(h3.equal({}, {})).toBeTruthy();
    expect(h3.equal([], [])).toBeTruthy();
    expect(h3.equal([], [1])).toBeFalsy();
    expect(h3.equal([2], [1])).toBeFalsy();
    expect(h3.equal([], {})).toBeFalsy();
    expect(h3.equal({ a: 1 }, { a: 1 })).toBeTruthy();
    expect(h3.equal({ a: 1 }, { b: 1 })).toBeFalsy();
    expect(h3.equal({ a: 1 }, { a: 2 })).toBeFalsy();
    expect(h3.equal({ a: 1 }, { a: 1, b: 2 })).toBeFalsy();
    expect(h3.equal(undefined, undefined)).toBeTruthy();
    expect(h3.equal(undefined, null)).toBeFalsy();
    expect(h3.equal(null, 1)).toBeFalsy();
    expect(h3.equal(null, null)).toBeTruthy();
    expect(
      h3.equal(
        () => 1,
        () => 1
      )
    ).toBeTruthy();
    expect(
      h3.equal(
        () => 1,
        () => 2
      )
    ).toBeFalsy();
    expect(h3.equal([1, 2, 3], [1, 2, 3])).toBeTruthy();
    expect(h3.equal([1, 2, 3], [1, 4, 3])).toBeFalsy();
    expect(h3.equal([1, 2, 3], [1, 3])).toBeFalsy();
  });

  it("should expose an equal method to check nested object/array equality, including standard types and functions", () => {
    const obj1 = {
      a: 1,
      b: 2,
      c: {
        a: [1, 2, 3, { b: true, d: false }],
        d: {
          q: null,
          v: undefined,
          a: [
            {
              onclick: function () {
                console.log("test");
              },
            },
          ],
        },
      },
    };
    const obj2 = {
      a: 1,
      b: 2,
      c: {
        a: [1, 2, 3, { b: true, d: false }],
        d: {
          q: null,
          v: undefined,
          a: [
            {
              onclick: function () {
                console.log("test");
              },
            },
          ],
        },
      },
    };
    expect(h3.equal(obj1, obj2)).toBe(true);
  });

  it("should support the creation of empty virtual node elements", () => {
    expect(h3("div")).toEqual({
      type: "div",
      children: [],
      attributes: {},
      classList: [],
      data: {},
      eventListeners: {},
      id: undefined,
      key: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should throw an error when invalid arguments are supplied", () => {
    const empty = () => h3();
    const invalid1st = () => h3(1);
    const invalid1st2 = () => h3(1, {});
    const invalid1st3 = () => h3(1, {}, []);
    const invalid2nd = () => h3("div", 1);
    const invalid2nd2 = () => h3("div", true, []);
    const invalid2nd3 = () => h3("div", null, []);
    expect(empty).toThrowError(/No arguments passed/);
    expect(invalid1st).toThrowError(/Invalid first argument/);
    expect(invalid1st2).toThrowError(/Invalid first argument/);
    expect(invalid1st3).toThrowError(/Invalid first argument/);
    expect(invalid2nd).toThrowError(/second argument of a VNode constructor/);
    expect(invalid2nd2).toThrowError(/Invalid second argument/);
    expect(invalid2nd3).toThrowError(/Invalid second argument/);
  });

  it("should support the creation of elements with a single, non-array child", () => {
    const vnode1 = h3("div", () => "test");
    const vnode2 = h3("div", () => h3("span"));
    expect(vnode1.children[0].value).toEqual("test");
    expect(vnode2.children[0].type).toEqual("span");
  });

  it("should support the creation of nodes with a single child node", () => {
    const result = {
      type: "div",
      children: [
        {
          type: "#text",
          children: [],
          attributes: {},
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $key: undefined,
          $html: undefined,
          style: undefined,
          value: "test",
        },
      ],
      attributes: {},
      classList: [],
      data: {},
      eventListeners: {},
      id: undefined,
      $key: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    };
    expect(h3("div", "test")).toEqual(result);
    const failing = () => h3("***");
    expect(failing).toThrowError(/Invalid selector/);
  });

  it("should support the creation of virtual node elements with classes", () => {
    expect(h3("div.a.b.c")).toEqual({
      type: "div",
      children: [],
      attributes: {},
      classList: ["a", "b", "c"],
      data: {},
      eventListeners: {},
      id: undefined,
      key: undefined,
      style: undefined,
      type: "div",
      value: undefined,
    });
  });

  it("should support the creation of virtual node elements with attributes and classes", () => {
    expect(h3("div.test1.test2", { id: "test" })).toEqual({
      type: "div",
      children: [],
      classList: ["test1", "test2"],
      data: {},
      attributes: {},
      eventListeners: {},
      id: "test",
      key: undefined,
      style: undefined,
      type: "div",
      value: undefined,
    });
  });

  it("should support the creation of virtual node elements with text children and classes", () => {
    expect(h3("div.test", ["a", "b"])).toEqual({
      type: "div",
      children: [
        {
          attributes: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          type: "#text",
          value: "a",
        },
        {
          attributes: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          type: "#text",
          value: "b",
        },
      ],
      attributes: {},
      classList: ["test"],
      data: {},
      eventListeners: {},
      id: undefined,
      key: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should support the creation of virtual node elements with text children, attributes, and classes", () => {
    expect(
      h3("div.test", { title: "Test...", id: "test" }, ["a", "b"])
    ).toEqual({
      type: "div",
      children: [
        {
          attributes: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          type: "#text",
          value: "a",
        },
        {
          attributes: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          type: "#text",
          value: "b",
        },
      ],
      data: {},
      eventListeners: {},
      id: "test",
      key: undefined,
      style: undefined,
      value: undefined,
      attributes: { title: "Test..." },
      classList: ["test"],
    });
  });

  it("should support the creation of virtual node elements with attributes", () => {
    expect(h3("input", { type: "text", value: "AAA" })).toEqual({
      type: "input",
      children: [],
      data: {},
      eventListeners: {},
      id: undefined,
      key: undefined,
      style: undefined,
      value: "AAA",
      attributes: { type: "text" },
      classList: [],
    });
  });

  it("should support the creation of virtual node elements with element children and classes", () => {
    expect(
      h3("div.test", ["a", h3("span", ["test1"]), () => h3("span", ["test2"])])
    ).toEqual({
      attributes: {},
      type: "div",
      children: [
        {
          attributes: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          type: "#text",
          value: "a",
        },
        {
          type: "span",
          children: [
            {
              attributes: {},
              children: [],
              classList: [],
              data: {},
              eventListeners: {},
              id: undefined,
              key: undefined,
              style: undefined,
              type: "#text",
              value: "test1",
            },
          ],
          attributes: {},
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          value: undefined,
        },
        {
          type: "span",
          children: [
            {
              attributes: {},
              children: [],
              classList: [],
              data: {},
              eventListeners: {},
              id: undefined,
              key: undefined,
              style: undefined,
              type: "#text",
              value: "test2",
            },
          ],
          attributes: {},
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          key: undefined,
          style: undefined,
          value: undefined,
        },
      ],
      classList: ["test"],
      data: {},
      eventListeners: {},
      id: undefined,
      key: undefined,
      style: undefined,
      value: undefined,
    });
  });
});

describe("VNode", () => {
  it("should initialize itself based on another node or a function returning a VNode", () => {
    const a = h3("div#test", ["a", "b"]);
    const b = h3("span");
    const c = h3(a);
    const d = () => h3(a);
    b.from(a);
    expect(b).toEqual(a);
    expect(c).toEqual(a);
    expect(h3(d)).toEqual(a);
  });

  it("should provide a method to set properties", () => {
    const a = h3("div");
    const failing = () =>
      a.setProps({ id: "test", key: "aaa", onclick: "test" });
    expect(failing).toThrowError(/not a function/);
    const handler = () => "test";
    a.setProps({ id: "test", key: "aaa", onclick: handler });
    expect(a.key).toEqual("aaa");
    expect(a.id).toEqual("test");
    expect(a.eventListeners.click).toEqual(handler);
  });

  it("should provide a render method able to render textual nodes", () => {
    const createTextNode = jest.spyOn(document, "createTextNode");
    const node = h3.render("test");
    expect(createTextNode).toHaveBeenCalledWith("test");
    expect(node.constructor).toEqual(Text);
  });

  it("should provide a render method able to render simple element nodes", () => {
    const vnode = {
      type: "br",
      children: [],
      attributes: {},
      classList: [],
    };
    const createElement = jest.spyOn(document, "createElement");
    const node = h3.render(vnode);
    expect(createElement).toHaveBeenCalledWith("br");
    expect(node.constructor).toEqual(HTMLBRElement);
  });

  it("should provide a render method able to render element nodes with attributes and classes", () => {
    const vnode = {
      type: "span",
      children: [],
      attributes: { title: "test" },
      classList: ["test1", "test2"],
    };
    const createElement = jest.spyOn(document, "createElement");
    const node = h3.render(vnode);
    expect(createElement).toHaveBeenCalledWith("span");
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(node.getAttribute("title")).toEqual("test");
    expect(node.classList.value).toEqual("test1 test2");
  });

  it("should provide a render method able to render element nodes with children", () => {
    const vnode = {
      type: "ul",
      children: [
        {
          type: "li",
          children: ["test1"],
          attributes: {},
          classList: [],
        },
        {
          type: "li",
          children: ["test2"],
          attributes: {},
          classList: [],
        },
      ],
      attributes: {},
      classList: [],
    };
    const createElement = jest.spyOn(document, "createElement");
    const node = h3.render(vnode);
    expect(createElement).toHaveBeenCalledWith("ul");
    expect(createElement).toHaveBeenCalledWith("li");
    expect(node.constructor).toEqual(HTMLUListElement);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[1].constructor).toEqual(HTMLLIElement);
    expect(node.childNodes[0].childNodes[0].data).toEqual("test1");
  });

  it("should provide a render method able to render element nodes with a value", () => {
    const vnode = {
      type: "input",
      children: [],
      attributes: { value: "test" },
      classList: [],
    };
    const createElement = jest.spyOn(document, "createElement");
    const node = h3.render(vnode);
    expect(createElement).toHaveBeenCalledWith("input");
    expect(node.constructor).toEqual(HTMLInputElement);
    expect(node.value).toEqual("test");
  });

  it("should provide a render method able to render element nodes with event handlers", () => {
    const handler = () => {
      console.log("test");
    };
    const vnode = {
      type: "button",
      children: [],
      attributes: { onclick: handler },
      classList: [],
    };
    const button = document.createElement("button");
    const createElement = jest
      .spyOn(document, "createElement")
      .mockImplementationOnce(() => {
        return button;
      });
    const addEventListener = jest.spyOn(button, "addEventListener");
    const node = h3.render(vnode);
    expect(createElement).toHaveBeenCalledWith("button");
    expect(node.constructor).toEqual(HTMLButtonElement);
    expect(addEventListener).toHaveBeenCalledWith("click", handler);
  });

  it("should provide a redraw method that is able to add new DOM nodes", () => {
    const oldvnode = {
      type: "div",
      children: [
        {
          type: "span",
          children: [],
          attributes: {},
          classList: [],
        },
      ],
      attributes: {},
      classList: [],
    };
    const newvnode = {
      type: "div",
      children: [
        {
          type: "span",
          children: [],
          attributes: { id: "a" },
          classList: [],
        },
        {
          type: "span",
          children: [],
          attributes: {},
          classList: [],
        },
      ],
      attributes: {},
      classList: [],
    };
    const node = h3.render(oldvnode);
    const span = node.childNodes[0];
    h3.redraw(node, newvnode, oldvnode);
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(2);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].id).toEqual("a");
    expect(span).toEqual(node.childNodes[1]);
  });

  it("should provide a redraw method that is able to remove existing DOM nodes", () => {
    const newvnode = {
      type: "div",
      children: [
        {
          type: "span",
          children: [],
          attributes: {},
          classList: [],
        },
      ],
      attributes: {},
      classList: [],
    };
    const oldvnode = {
      type: "div",
      children: [
        {
          type: "span",
          children: [],
          attributes: { id: "a" },
          classList: [],
        },
        {
          type: "span",
          children: [],
          attributes: {},
          classList: [],
        },
      ],
      attributes: {},
      classList: [],
    };
    const node = h3.render(oldvnode);
    const span = node.childNodes[1];
    h3.redraw(node, newvnode, oldvnode);
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(1);
    expect(node.childNodes.length).toEqual(1);
    expect(span).toEqual(node.childNodes[0]);
  });

  it("should provide a redraw method that is able to update different attributes", () => {
    const oldvnode = {
      type: "span",
      children: [],
      attributes: { title: "a", something: "b" },
      classList: [],
    };
    const newvnode = {
      type: "span",
      children: [],
      attributes: { title: "b", id: "bbb" },
      classList: [],
    };
    const node = h3.render(oldvnode);
    h3.redraw(node, newvnode, oldvnode);
    expect(oldvnode).toEqual(newvnode);
    expect(node.getAttribute("title")).toEqual("b");
    expect(node.getAttribute("id")).toEqual("bbb");
    expect(node.hasAttribute("something")).toEqual(false);
  });

  it("should provide a redraw method that is able to update different classes", () => {
    const oldvnode = {
      type: "span",
      children: [],
      attributes: { title: "b" },
      classList: ["a", "b"],
    };
    const newvnode = {
      type: "span",
      children: [],
      attributes: { title: "b" },
      classList: ["c"],
    };
    const node = h3.render(oldvnode);
    h3.redraw(node, newvnode, oldvnode);
    expect(oldvnode).toEqual(newvnode);
    expect(node.classList.value).toEqual("c");
  });

  it("should provide diff method to detect changed nodes if they have different elements", () => {
    let oldvnode = {
      type: "span",
      children: [],
      attributes: { title: "b" },
      classList: ["c"],
    };
    const newvnode = {
      type: "div",
      children: [],
      attributes: { title: "baaab" },
      classList: ["c"],
    };
    const container = document.createElement("div");
    const node = h3.render(oldvnode);
    container.appendChild(node);
    h3.redraw(node, newvnode, oldvnode);
    expect(node).not.toEqual(container.childNodes[0]);
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(container.childNodes[0].constructor).toEqual(HTMLDivElement);
  });

  it("should provide diff method to detect changed nodes if they have different node types", () => {
    let oldvnode = {
      type: "span",
      children: [],
      attributes: { title: "b" },
      classList: ["c"],
    };
    const newvnode = "test";
    const container = document.createElement("div");
    const node = h3.render(oldvnode);
    container.appendChild(node);
    expect(node.constructor).toEqual(HTMLSpanElement);
    h3.redraw(node, newvnode, oldvnode);
    expect(node).not.toEqual(container.childNodes[0]);
    expect(container.childNodes[0].data).toEqual("test");
  });

  it("should provide diff method to detect changed nodes if they have different text", () => {
    const oldvnode = "test1";
    const newvnode = "test2";
    const container = document.createElement("div");
    const node = h3.render(oldvnode);
    container.appendChild(node);
    expect(node.data).toEqual("test1");
    h3.redraw(node, newvnode, oldvnode);
    expect(container.childNodes[0].data).toEqual("test2");
  });

  it("should provide diff method to detect changed nodes and recurse", () => {
    const oldvnode = {
      type: "ul",
      children: [
        {
          type: "li",
          attributes: { id: "aaa" },
          children: [],
          classList: [],
        },
        {
          type: "li",
          attributes: { id: "bbb" },
          children: [],
          classList: [],
        },
        {
          type: "li",
          attributes: { id: "ccc" },
          children: [],
          classList: [],
        },
      ],
      attributes: { title: "b" },
      classList: ["c"],
    };
    const newvnode = {
      type: "ul",
      children: [
        {
          type: "li",
          attributes: { id: "aaa" },
          children: [],
          classList: [],
        },
        {
          type: "li",
          attributes: { id: "ccc" },
          children: [],
          classList: [],
        },
      ],
      attributes: { title: "b" },
      classList: ["c"],
    };
    const node = h3.render(oldvnode);
    h3.redraw(node, newvnode, oldvnode);
    expect(oldvnode).toEqual(newvnode);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].getAttribute("id")).toEqual("aaa");
    expect(node.childNodes[1].getAttribute("id")).toEqual("ccc");
  });

  it("should provide a component method to instantiate components", function () {
    const c = {
      view: function (h3, data) {
        return h3.equal(1, data);
      },
    };
    expect(h3.component(c)(1)).toEqual(true);
  });
});
