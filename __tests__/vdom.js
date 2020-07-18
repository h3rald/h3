const lib = require("../vdom.js");
const update = lib.update;
const h = lib.h;

describe("Virtual DOM Implementation", () => {
  it("should provide a from method to initialize itself from an object", () => {
    const fn = () => true;
    const obj = {
      id: "test",
      type: "input",
      value: "AAA",
      $html: "",
      data: { a: "1", b: "2" },
      eventListeners: { click: fn },
      children: [],
      props: { title: "test" },
      classList: ["a1", "a2"],
      style: "padding: 2px",
    };
    const vnode1 = h("br");
    vnode1.from(obj);
    const vnode2 = h("input#test.a1.a2", {
      value: "AAA",
      $html: "",
      data: { a: "1", b: "2" },
      onclick: fn,
      title: "test",
      style: "padding: 2px",
    });
    expect(vnode1).toEqual(vnode2);
  });

  it("should provide a render method able to render textual nodes", () => {
    const createTextNode = jest.spyOn(document, "createTextNode");
    const vnode = h({ type: "#text", value: "test" });
    const node = vnode.render();
    expect(createTextNode).toHaveBeenCalledWith("test");
    expect(node.constructor).toEqual(Text);
  });

  it("should provide a render method able to render simple element nodes", () => {
    const createElement = jest.spyOn(document, "createElement");
    const vnode = h("br");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("br");
    expect(node.constructor).toEqual(HTMLBRElement);
  });

  it("should provide a render method able to render element nodes with props and classes", () => {
    const createElement = jest.spyOn(document, "createElement");
    const vnode = h("span.test1.test2", { title: "test", falsy: false });
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("span");
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(node.getAttribute("title")).toEqual("test");
    expect(node.classList.value).toEqual("test1 test2");
  });

  it("should provide a render method able to render element nodes with children", () => {
    const vnode = h("ul", [h("li", "test1"), h("li", "test2")]);
    const createElement = jest.spyOn(document, "createElement");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("ul");
    expect(createElement).toHaveBeenCalledWith("li");
    expect(node.constructor).toEqual(HTMLUListElement);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[1].constructor).toEqual(HTMLLIElement);
    expect(node.childNodes[0].childNodes[0].data).toEqual("test1");
  });

  it("should handle boolean props when redrawing", () => {
    const vnode1 = h("input", { type: "checkbox", checked: true });
    const node = vnode1.render();
    expect(node.checked).toEqual(true);
    const vnode = h("input", { type: "checkbox", checked: false });
    vnode1.redraw({ node, vnode });
    expect(node.checked).toEqual(false);
  });

  it("should handle non-string props as properties and not create props", () => {
    const v = h("div", {
      test: true,
      obj: { a: 1, b: 2 },
      arr: [1, 2, 3],
      num: 2.3,
      str: "test",
      s: "",
      title: "testing!",
      value: false,
    });
    const n = v.render();
    expect(n.test).toEqual(true);
    expect(n.obj).toEqual({ a: 1, b: 2 });
    expect(n.arr).toEqual([1, 2, 3]);
    expect(n.num).toEqual(2.3);
    expect(n.str).toEqual("test");
    expect(n.getAttribute("str")).toEqual("test");
    expect(n.s).toEqual("");
    expect(n.getAttribute("s")).toEqual(null);
    expect(n.title).toEqual("testing!");
    expect(n.getAttribute("title")).toEqual("testing!");
    expect(n.value).toEqual(undefined);
    expect(n.getAttribute("value")).toEqual(null);
  });

  it("should provide a render method able to render element nodes with a value", () => {
    const vnode = h("input", { value: "test" });
    const createElement = jest.spyOn(document, "createElement");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("input");
    expect(node.constructor).toEqual(HTMLInputElement);
    expect(node.value).toEqual("test");
  });

  it("should provide a render method able to render element nodes with event handlers", () => {
    const handler = () => {
      console.log("test");
    };
    const vnode = h("button", { onclick: handler });
    const button = document.createElement("button");
    const createElement = jest
      .spyOn(document, "createElement")
      .mockImplementationOnce(() => {
        return button;
      });
    const addEventListener = jest.spyOn(button, "addEventListener");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("button");
    expect(node.constructor).toEqual(HTMLButtonElement);
    expect(addEventListener).toHaveBeenCalledWith("click", handler);
  });

  it("it should provide a render method able to render elements with special props", () => {
    const vnode = h("div", {
      id: "test",
      style: "margin: auto;",
      data: { test: "aaa" },
      $html: "<p>Hello!</p>",
    });
    const createElement = jest.spyOn(document, "createElement");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("div");
    expect(node.constructor).toEqual(HTMLDivElement);
    expect(node.style.cssText).toEqual("margin: auto;");
    expect(node.id).toEqual("test");
    expect(node.dataset["test"]).toEqual("aaa");
    expect(node.childNodes[0].textContent).toEqual("Hello!");
  });

  it("should provide a redraw method that is able to add new DOM nodes", () => {
    const oldvnode = h("div#test", h("span"));
    const newvnodeNoChildren = h("div");
    const newvnode = h("div", [h("span#a"), h("span")]);
    const node = oldvnode.render();
    const span = node.childNodes[0];
    oldvnode.redraw({ node: node, vnode: newvnodeNoChildren });
    expect(oldvnode.children.length).toEqual(0);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(2);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].id).toEqual("a");
    expect(span).toEqual(node.childNodes[1]);
  });

  it("should provide a redraw method that is able to remove existing DOM nodes", () => {
    let oldvnode = h("div", [h("span#a"), h("span")]);
    let newvnode = h("div", [h("span")]);
    let node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(1);
    expect(node.childNodes.length).toEqual(1);
    oldvnode = h("div.test-children", [h("span.a"), h("span.b")]);
    node = oldvnode.render();
    newvnode = h("div.test-children", [h("div.c")]);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(1);
    expect(node.childNodes.length).toEqual(1);
    expect(oldvnode.children[0].classList[0]).toEqual("c");
  });

  it("should provide a redraw method that is able to figure out differences in children", () => {
    const oldvnode = h("div", [h("span", "a"), h("span"), h("span", "b")]);
    const newvnode = h("div", [h("span", "a"), h("span", "c"), h("span", "b")]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node.childNodes[1].textContent).toEqual("c");
  });

  it("should provide a redraw method that is able to figure out differences in existing children", () => {
    const oldvnode = h("div", [
      h("span.test", "a"),
      h("span.test", "b"),
      h("span.test", "c"),
    ]);
    const newvnode = h("div", [
      h("span.test", "a"),
      h("span.test1", "b"),
      h("span.test", "c"),
    ]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node.childNodes[0].classList[0]).toEqual("test");
    expect(node.childNodes[1].classList[0]).toEqual("test1");
    expect(node.childNodes[2].classList[0]).toEqual("test");
  });

  it("should provide a redraw method that is able to update different props", () => {
    const oldvnode = h("span", { title: "a", something: "b" });
    const newvnode = h("span", { title: "b", id: "bbb" });
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.getAttribute("title")).toEqual("b");
    expect(node.getAttribute("id")).toEqual("bbb");
    expect(node.hasAttribute("something")).toEqual(false);
  });

  it("should provide a redraw method that is able to update different classes", () => {
    const oldvnode = h("span.a.b", { title: "b" });
    const newvnode = h("span.a.c", { title: "b" });
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.classList.value).toEqual("a c");
  });

  it("should provide redraw method to detect changed nodes if they have different elements", () => {
    const oldvnode = h("span.c", { title: "b" });
    const newvnode = h("div.c", { title: "b" });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node).not.toEqual(container.childNodes[0]);
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(container.childNodes[0].constructor).toEqual(HTMLDivElement);
  });

  it("should provide redraw method to detect position changes in child nodes", () => {
    const v1 = h("ul", [h("li.a"), h("li.b"), h("li.c"), h("li.d")]);
    const v2 = h("ul", [h("li.c"), h("li.b"), h("li.a"), h("li.d")]);
    const n = v1.render();
    expect(n.childNodes[0].classList[0]).toEqual("a");
    v1.redraw({ node: n, vnode: v2 });
    expect(n.childNodes[0].classList[0]).toEqual("c");
  });

  it("should provide redraw method to detect changed nodes if they have different node types", () => {
    const oldvnode = h("span.c", { title: "b" });
    const newvnode = h({ type: "#text", value: "test" });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    expect(node.constructor).toEqual(HTMLSpanElement);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node).not.toEqual(container.childNodes[0]);
    expect(container.childNodes[0].data).toEqual("test");
  });

  it("should provide redraw method to detect changed nodes if they have different text", () => {
    const oldvnode = h({ type: "#text", value: "test1" });
    const newvnode = h({ type: "#text", value: "test2" });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    expect(node.data).toEqual("test1");
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(container.childNodes[0].data).toEqual("test2");
  });

  it("should provide redraw method to detect changed nodes and recurse", () => {
    const oldvnode = h("ul.c", { title: "b" }, [
      h("li#aaa"),
      h("li#bbb"),
      h("li#ccc"),
    ]);
    const newvnode = h("ul.c", { title: "b" }, [h("li#aaa"), h("li#ccc")]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].getAttribute("id")).toEqual("aaa");
    expect(node.childNodes[1].getAttribute("id")).toEqual("ccc");
  });

  it("should provide a redraw method able to detect specific changes to style, data, value, props, $onrender and eventListeners", () => {
    const fn = () => false;
    const oldvnode = h("input", {
      style: "margin: auto;",
      data: { a: 111, b: 222, d: 444 },
      value: "Test...",
      title: "test",
      label: "test",
      onkeydown: () => true,
      onclick: () => true,
      onkeypress: () => true,
    });
    const newvnode = h("input", {
      style: false,
      data: { a: 111, b: 223, c: 333 },
      title: "test #2",
      label: "test",
      placeholder: "test",
      onkeydown: () => true,
      onkeypress: () => false,
      $onrender: () => true,
      onhover: () => true,
    });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.style.cssText).toEqual("");
    expect(node.dataset["a"]).toEqual("111");
    expect(node.dataset["c"]).toEqual("333");
    expect(node.dataset["b"]).toEqual("223");
    expect(node.dataset["d"]).toEqual(undefined);
    expect(node.getAttribute("title")).toEqual("test #2");
    expect(node.getAttribute("placeholder")).toEqual("test");
    expect(node.value).toEqual("");
  });

  it("should provide a redraw method able to detect changes in child content", () => {
    const v1 = h("ul", [h("li", "a"), h("li", "b")]);
    const n1 = v1.render();
    const v2 = h("ul", {
      $html: "<li>a</li><li>b</li>",
      $onrender: (node) => node.classList.add("test"),
    });
    const v3 = h("ul", [h("li", "a")]);
    const v4 = h("ul", [h("li", "b")]);
    const n2 = v2.render();
    const n3 = v3.render();
    expect(n2.childNodes[0].childNodes[0].data).toEqual(
      n1.childNodes[0].childNodes[0].data
    );
    v1.redraw({ node: n1, vnode: v2 });
    expect(n1.classList[0]).toEqual("test");
    expect(v1).toEqual(v2);
    v3.redraw({ node: n3, vnode: v4 });
    expect(v3).toEqual(v4);
  });

  it("should support a way to discriminate functions and objects", () => {
    const v1 = h("div", { onclick: () => true });
    const v2 = h("div", { onclick: () => true });
    const v3 = h("div", { onclick: () => false });
    const v4 = h("div");
    const v5 = h("div", { a: 1, b: 2 });
    const v6 = h("div", { b: 2 });
    expect(v1.equal(v2)).toEqual(false);
    expect(v1.equal(v3)).toEqual(false);
    expect(v4.equal({ type: "div" })).toEqual(false);
    expect(v5.equal(v6)).toEqual(false);
    expect(v1.equal(null, null)).toEqual(true);
    expect(v1.equal(null, undefined)).toEqual(false);
  });

  it("should support the creation of empty virtual node elements", () => {
    expect(h("div")).toEqual({
      type: "div",
      children: [],
      props: {},
      classList: [],
      data: {},
      eventListeners: {},
      id: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should throw an error when invalid arguments are supplied", () => {
    const empty = () => h();
    const invalid1st = () => h(1);
    const invalid1st2 = () => h(1, {});
    const invalid1st3 = () => h(1, {}, []);
    const invalid1st1 = () => h(() => ({ type: "#text", value: "test" }));
    const invalid1st1b = () => h({ a: 2 });
    const invalid2nd = () => h("div", 1);
    const invalid2nd2 = () => h("div", true, []);
    const invalid2nd3 = () => h("div", null, []);
    const invalidChildren = () => h("div", ["test", 1, 2]);
    const emptySelector = () => h("");
    expect(empty).toThrowError(/No arguments passed/);
    expect(invalid1st).toThrowError(/Invalid first argument/);
    expect(invalid1st2).toThrowError(/Invalid first argument/);
    expect(invalid1st3).toThrowError(/Invalid first argument/);
    expect(invalid1st1).toThrowError(/does not return a VNode/);
    expect(invalid1st1b).toThrowError(/Invalid first argument/);
    expect(invalid2nd).toThrowError(/second argument of a VNode constructor/);
    expect(invalid2nd2).toThrowError(/Invalid second argument/);
    expect(invalid2nd3).toThrowError(/Invalid second argument/);
    expect(invalidChildren).toThrowError(/not a VNode: 1/);
    expect(emptySelector).toThrowError(/Invalid selector/);
  });

  it("should support several child arguments", () => {
    let vnode = h("div", { test: "a" }, "a", "b", "c");
    expect(vnode.children.length).toEqual(3);
    vnode = h("div", "a", "b", "c");
    expect(vnode.children.length).toEqual(3);
    vnode = h("div", "a", "b");
    expect(vnode.children.length).toEqual(2);
  });

  it("should support the creation of elements with a single, non-array child", () => {
    const vnode1 = h("div", () => "test");
    const vnode2 = h("div", () => h("span"));
    expect(vnode1.children[0].value).toEqual("test");
    expect(vnode2.children[0].type).toEqual("span");
  });

  it("should remove null/false/undefined children", () => {
    const v1 = h("div", [false, "test", undefined, null, ""]);
    expect(v1.children).toEqual([
      h({ type: "#text", value: "test" }),
      h({ type: "#text", value: "" }),
    ]);
  });

  it("should support the creation of nodes with a single child node", () => {
    const result = {
      type: "div",
      children: [
        {
          type: "#text",
          children: [],
          props: {},
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $html: undefined,
          style: undefined,
          value: "test",
        },
      ],
      props: {},
      classList: [],
      data: {},
      eventListeners: {},
      id: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    };
    expect(h("div", "test")).toEqual(result);
    const failing = () => h("***");
    expect(failing).toThrowError(/Invalid selector/);
  });

  it("should support the creation of virtual node elements with classes", () => {
    const a = h("div.a.b.c");
    const b = h("div", { classList: ["a", "b", "c"] });
    expect(a).toEqual({
      type: "div",
      children: [],
      props: {},
      classList: ["a", "b", "c"],
      data: {},
      eventListeners: {},
      id: undefined,
      $html: undefined,
      style: undefined,
      type: "div",
      value: undefined,
    });
    expect(a).toEqual(b);
  });

  it("should support the creation of virtual node elements with props and classes", () => {
    expect(h("div.test1.test2", { id: "test" })).toEqual({
      type: "div",
      children: [],
      classList: ["test1", "test2"],
      data: {},
      props: {},
      eventListeners: {},
      id: "test",
      $html: undefined,
      style: undefined,
      type: "div",
      value: undefined,
    });
  });

  it("should support the creation of virtual node elements with text children and classes", () => {
    expect(h("div.test", ["a", "b"])).toEqual({
      type: "div",
      children: [
        {
          props: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $html: undefined,
          style: undefined,
          type: "#text",
          value: "a",
        },
        {
          props: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $html: undefined,
          style: undefined,
          type: "#text",
          value: "b",
        },
      ],
      props: {},
      classList: ["test"],
      data: {},
      eventListeners: {},
      id: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should support the creation of virtual node elements with text children, props, and classes", () => {
    expect(h("div.test", { title: "Test...", id: "test" }, ["a", "b"])).toEqual(
      {
        type: "div",
        children: [
          {
            props: {},
            children: [],
            classList: [],
            data: {},
            eventListeners: {},
            id: undefined,
            $html: undefined,
            style: undefined,
            type: "#text",
            value: "a",
          },
          {
            props: {},
            children: [],
            classList: [],
            data: {},
            eventListeners: {},
            id: undefined,
            $html: undefined,
            style: undefined,
            type: "#text",
            value: "b",
          },
        ],
        data: {},
        eventListeners: {},
        id: "test",
        $html: undefined,
        style: undefined,
        value: undefined,
        props: { title: "Test..." },
        classList: ["test"],
      }
    );
  });

  it("should support the creation of virtual node elements with props", () => {
    expect(h("input", { type: "text", value: "AAA" })).toEqual({
      type: "input",
      children: [],
      data: {},
      eventListeners: {},
      id: undefined,
      $html: undefined,
      style: undefined,
      value: "AAA",
      props: { type: "text" },
      classList: [],
    });
  });

  it("should support the creation of virtual node elements with event handlers", () => {
    const fn = () => true;
    expect(h("button", { onclick: fn })).toEqual({
      type: "button",
      children: [],
      data: {},
      eventListeners: {
        click: fn,
      },
      id: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
      props: {},
      classList: [],
    });
    expect(() => h("span", { onclick: "something" })).toThrowError(
      /onclick event is not a function/
    );
  });

  it("should support the creation of virtual node elements with element children and classes", () => {
    expect(
      h("div.test", ["a", h("span", ["test1"]), () => h("span", ["test2"])])
    ).toEqual({
      props: {},
      type: "div",
      children: [
        {
          props: {},
          children: [],
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $html: undefined,
          style: undefined,
          type: "#text",
          value: "a",
        },
        {
          type: "span",
          children: [
            {
              props: {},
              children: [],
              classList: [],
              data: {},
              eventListeners: {},
              id: undefined,
              $html: undefined,
              style: undefined,
              type: "#text",
              value: "test1",
            },
          ],
          props: {},
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $html: undefined,
          style: undefined,
          value: undefined,
        },
        {
          type: "span",
          children: [
            {
              props: {},
              children: [],
              classList: [],
              data: {},
              eventListeners: {},
              id: undefined,
              $html: undefined,
              style: undefined,
              type: "#text",
              value: "test2",
            },
          ],
          props: {},
          classList: [],
          data: {},
          eventListeners: {},
          id: undefined,
          $html: undefined,
          style: undefined,
          value: undefined,
        },
      ],
      classList: ["test"],
      data: {},
      eventListeners: {},
      id: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should provide an update method to efficently update a DOM element", () => {
    const app = document.createElement("div");
    document.body.appendChild(app);
    const v1 = h(
      "div",
      h("h1#title", "Test"),
      h("p#paragraph", "This is a test.")
    );
    const v2 = h(
      "div",
      h("h1#title", "Test"),
      h("p#paragraph", "This is another test.")
    );
    expect(() => update(v1, v2)).toThrowError(/does not include a reference/);
    const ref = update(app, v1);
    expect(ref.element.children.length).toEqual(2);
    expect(document.getElementById("title").textContent).toEqual("Test");
    expect(document.getElementById("paragraph").textContent).toEqual(
      "This is a test."
    );
    update(ref, v2);
    expect(document.getElementById("paragraph").textContent).toEqual(
      "This is another test."
    );
  });

  it("should execute $onrender callbacks whenever a child node is added to the DOM", async () => {
    let n;
    const $onrender = (node) => {
      n = node;
    };
    const vn1 = h("ul", [h("li.vn1", { $onrender })]);
    const vn2 = h("ul", [h("li"), h("li.vn2", { $onrender })]);
    const n1 = vn1.render();
    expect(n.classList.value).toEqual("vn1");
    vn1.redraw({ node: n1, vnode: vn2 });
    expect(n.classList.value).toEqual("vn2");
    const vn3 = h("ul", [h("span.vn3", { $onrender })]);
    vn1.redraw({ node: n1, vnode: vn3 });
    expect(n.classList.value).toEqual("vn3");
  });
});
