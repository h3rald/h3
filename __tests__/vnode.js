const h3 = require("../h3.js").default;

describe("VNode", () => {
  it("should provide a from method to initialize itself from an object", () => {
    const fn = () => true;
    const obj = {
      id: "test",
      type: "input",
      value: "AAA",
      $key: "123",
      $html: "",
      data: { a: "1", b: "2" },
      eventListeners: { click: fn },
      children: [],
      attributes: { title: "test" },
      classList: ["a1", "a2"],
      style: "padding: 2px",
    };
    const vnode1 = h3("br");
    vnode1.from(obj);
    const vnode2 = h3("input#test.a1.a2", {
      value: "AAA",
      $key: "123",
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
    const vnode = h3({ type: "#text", value: "test" });
    const node = vnode.render();
    expect(createTextNode).toHaveBeenCalledWith("test");
    expect(node.constructor).toEqual(Text);
  });

  it("should provide a render method able to render simple element nodes", () => {
    const createElement = jest.spyOn(document, "createElement");
    const vnode = h3("br");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("br");
    expect(node.constructor).toEqual(HTMLBRElement);
  });

  it("should provide a render method able to render element nodes with attributes and classes", () => {
    const createElement = jest.spyOn(document, "createElement");
    const vnode = h3("span.test1.test2", { title: "test", falsy: false });
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("span");
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(node.getAttribute("title")).toEqual("test");
    expect(node.classList.value).toEqual("test1 test2");
  });

  it("should provide a render method able to render element nodes with children", () => {
    const vnode = h3("ul", [h3("li", "test1"), h3("li", "test2")]);
    const createElement = jest.spyOn(document, "createElement");
    const node = vnode.render();
    expect(createElement).toHaveBeenCalledWith("ul");
    expect(createElement).toHaveBeenCalledWith("li");
    expect(node.constructor).toEqual(HTMLUListElement);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[1].constructor).toEqual(HTMLLIElement);
    expect(node.childNodes[0].childNodes[0].data).toEqual("test1");
  });

  it("should provide a render method able to render element nodes with a value", () => {
    const vnode = h3("input", { value: "test" });
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
    const vnode = h3("button", { onclick: handler });
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

  it("it should provide a render method able to render elements with special attributes", () => {
    const vnode = h3("div", {
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
    const oldvnode = h3("div#test", h3("span"));
    const newvnodeNoChildren = h3("div");
    const newvnode = h3("div", [h3("span#a"), h3("span")]);
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
    const newvnode = h3("div", [h3("span")]);
    const oldvnode = h3("div", [h3("span#a"), h3("span")]);
    const node = oldvnode.render();
    const span = node.childNodes[1];
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(oldvnode.children.length).toEqual(1);
    expect(node.childNodes.length).toEqual(1);
    expect(span).toEqual(node.childNodes[0]);
  });

  it("should provide a redraw method that is able to figure out differences in children", () => {
    const oldvnode = h3("div", [h3("span", "a"), h3("span"), h3("span", "b")]);
    const newvnode = h3("div", [
      h3("span", "a"),
      h3("span", "c"),
      h3("span", "b"),
    ]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node.childNodes[1].textContent).toEqual("c");
  });

  it("should provide a redraw method that is able to update different attributes", () => {
    const oldvnode = h3("span", { title: "a", something: "b" });
    const newvnode = h3("span", { title: "b", id: "bbb" });
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.getAttribute("title")).toEqual("b");
    expect(node.getAttribute("id")).toEqual("bbb");
    expect(node.hasAttribute("something")).toEqual(false);
  });

  it("should provide a redraw method that is able to update different classes", () => {
    const oldvnode = h3("span.a.b", { title: "b" });
    const newvnode = h3("span.a.c", { title: "b" });
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.classList.value).toEqual("a c");
  });

  it("should provide redraw method to detect changed nodes if they have different elements", () => {
    const oldvnode = h3("span.c", { title: "b" });
    const newvnode = h3("div.c", { title: "b" });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node).not.toEqual(container.childNodes[0]);
    expect(node.constructor).toEqual(HTMLSpanElement);
    expect(container.childNodes[0].constructor).toEqual(HTMLDivElement);
  });

  it("should provide redraw method to detect changed nodes if they have different node types", () => {
    const oldvnode = h3("span.c", { title: "b" });
    const newvnode = h3({ type: "#text", value: "test" });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    expect(node.constructor).toEqual(HTMLSpanElement);
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(node).not.toEqual(container.childNodes[0]);
    expect(container.childNodes[0].data).toEqual("test");
  });

  it("should provide redraw method to detect changed nodes if they have different text", () => {
    const oldvnode = h3({ type: "#text", value: "test1" });
    const newvnode = h3({ type: "#text", value: "test2" });
    const container = document.createElement("div");
    const node = oldvnode.render();
    container.appendChild(node);
    expect(node.data).toEqual("test1");
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(container.childNodes[0].data).toEqual("test2");
  });

  it("should provide redraw method to detect changed nodes and recurse", () => {
    const oldvnode = h3("ul.c", { title: "b" }, [
      h3("li#aaa"),
      h3("li#bbb"),
      h3("li#ccc"),
    ]);
    const newvnode = h3("ul.c", { title: "b" }, [h3("li#aaa"), h3("li#ccc")]);
    const node = oldvnode.render();
    oldvnode.redraw({ node: node, vnode: newvnode });
    expect(oldvnode).toEqual(newvnode);
    expect(node.childNodes.length).toEqual(2);
    expect(node.childNodes[0].getAttribute("id")).toEqual("aaa");
    expect(node.childNodes[1].getAttribute("id")).toEqual("ccc");
  });

  it("should provide a redraw method able to detect specific changes to style, data, value, attributes and eventListeners", () => {
    const fn = () => false;
    const oldvnode = h3("input", {
      style: "margin: auto;",
      data: { a: 111, b: 222, d: 444 },
      value: "Test...",
      title: "test",
      label: "test",
      onkeydown: () => true,
      onclick: () => true,
      onkeypress: () => true,
    });
    const newvnode = h3("input", {
      style: false,
      data: { a: 111, b: 223, c: 333 },
      title: "test #2",
      label: "test",
      placeholder: "test",
      onkeydown: () => true,
      onkeypress: () => false,
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
    const v1 = h3("ul", [h3("li", "a"), h3("li", "b")]);
    const n1 = v1.render();
    const v2 = h3("ul", { $html: "<li>a</li><li>b</li>" });
    const v3 = h3("ul", [h3("li", "a")]);
    const v4 = h3("ul", [h3("li", "b")]);
    const n2 = v2.render();
    const n3 = v3.render();
    expect(n2.childNodes[0].childNodes[0].data).toEqual(
      n1.childNodes[0].childNodes[0].data
    );
    v1.redraw({ node: n1, vnode: v2 });
    expect(v1).toEqual(v2);
    v3.redraw({ node: n3, vnode: v4 });
    expect(v3).toEqual(v4);
  });
});
