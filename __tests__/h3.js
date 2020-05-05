const h3 = require("../h3.js").default;

describe("h3", () => {
  beforeEach(() => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb) => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
  });

  it("should support a way to discriminate functions and objects", () => {
    const v1 = h3("div", { onclick: () => true });
    const v2 = h3("div", { onclick: () => true });
    const v3 = h3("div", { onclick: () => false });
    const v4 = h3("div");
    expect(v1.equal(v2)).toEqual(true);
    expect(v1.equal(v3)).toEqual(false);
    expect(v4.equal({ type: "div" })).toEqual(false);
    expect(v1.equal(null, null)).toEqual(true);
    expect(v1.equal(null, undefined)).toEqual(false);
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
      $key: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should throw an error when invalid arguments are supplied", () => {
    const empty = () => h3();
    const invalid1st = () => h3(1);
    const invalid1st2 = () => h3(1, {});
    const invalid1st3 = () => h3(1, {}, []);
    const invalid1st1 = () => h3(() => ({ type: "#text", value: "test" }));
    const invalid1st1b = () => h3({ a: 2 });
    const invalid2nd = () => h3("div", 1);
    const invalid2nd2 = () => h3("div", true, []);
    const invalid2nd3 = () => h3("div", null, []);
    const invalidChildren = () => h3("div", ["test", 1, 2]);
    const tooManyArgs = () => h3("div", { id: "test" }, "test", "aaa");
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
    expect(tooManyArgs).toThrowError(/Too many arguments/);
  });

  it("should support the creation of elements with a single, non-array child", () => {
    const vnode1 = h3("div", () => "test");
    const vnode2 = h3("div", () => h3("span"));
    expect(vnode1.children[0].value).toEqual("test");
    expect(vnode2.children[0].type).toEqual("span");
  });

  it("should remove null/false/undefined children", () => {
    const v1 = h3("div", [false, "test", undefined, null, ""]);
    expect(v1.children).toEqual([
      h3({ type: "#text", value: "test" }),
      h3({ type: "#text", value: "" }),
    ]);
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
    const a = h3("div.a.b.c");
    const b = h3("div", { classList: ["a", "b", "c"] });
    expect(a).toEqual({
      type: "div",
      children: [],
      attributes: {},
      classList: ["a", "b", "c"],
      data: {},
      eventListeners: {},
      id: undefined,
      $key: undefined,
      $html: undefined,
      style: undefined,
      type: "div",
      value: undefined,
    });
    expect(a).toEqual(b);
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
      $key: undefined,
      $html: undefined,
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
          $key: undefined,
          $html: undefined,
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
          $key: undefined,
          $html: undefined,
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
      $key: undefined,
      $html: undefined,
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
          $key: undefined,
          $html: undefined,
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
          $key: undefined,
          $html: undefined,
          style: undefined,
          type: "#text",
          value: "b",
        },
      ],
      data: {},
      eventListeners: {},
      id: "test",
      $key: undefined,
      $html: undefined,
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
      $key: undefined,
      $html: undefined,
      style: undefined,
      value: "AAA",
      attributes: { type: "text" },
      classList: [],
    });
  });

  it("should support the creation of virtual node elements with event handlers", () => {
    const fn = () => true;
    expect(h3("button", { onclick: fn })).toEqual({
      type: "button",
      children: [],
      data: {},
      eventListeners: {
        click: fn,
      },
      id: undefined,
      $key: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
      attributes: {},
      classList: [],
    });
    expect(() => h3("span", { onclick: "something" })).toThrowError(
      /onclick event is not a function/
    );
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
          $key: undefined,
          $html: undefined,
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
              $key: undefined,
              $html: undefined,
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
          $key: undefined,
          $html: undefined,
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
              $key: undefined,
              $html: undefined,
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
          $key: undefined,
          $html: undefined,
          style: undefined,
          value: undefined,
        },
      ],
      classList: ["test"],
      data: {},
      eventListeners: {},
      id: undefined,
      $key: undefined,
      $html: undefined,
      style: undefined,
      value: undefined,
    });
  });

  it("should not allow certain methods and properties to be called/accessed before initialization", () => {
    const route = () => h3.route;
    const state = () => h3.state;
    const redraw = () => h3.redraw();
    const dispatch = () => h3.dispatch();
    const on = () => h3.on();
    const navigateTo = () => h3.navigateTo();
    expect(route).toThrowError(/No application initialized/);
    expect(state).toThrowError(/No application initialized/);
    expect(redraw).toThrowError(/No application initialized/);
    expect(dispatch).toThrowError(/No application initialized/);
    expect(on).toThrowError(/No application initialized/);
    expect(navigateTo).toThrowError(/No application initialized/);
  });

  it("should provide an init method to initialize a SPA with a single component", async () => {
    const c = () => h3("div", "Hello, World!");
    const body = document.body;
    const appendChild = jest.spyOn(body, "appendChild");
    await h3.init(c);
    expect(appendChild).toHaveBeenCalled();
    expect(body.childNodes[0].childNodes[0].data).toEqual("Hello, World!");
  });

  it("should provide some validation at initialization time", async () => {
    try {
      await h3.init({ element: "INVALID", routes: {} });
    } catch (e) {
      expect(e.message).toMatch(/Invalid element/);
    }
    try {
      await h3.init({ element: document.body });
    } catch (e) {
      expect(e.message).toMatch(/not a valid configuration object/);
    }
    try {
      await h3.init({ element: document.body, routes: {} });
    } catch (e) {
      expect(e.message).toMatch(/No routes/);
    }
  });

  it("should expose a redraw method", async () => {
    const vnode = h3("div");
    await h3.init(() => vnode);
    jest.spyOn(vnode, "redraw");
    h3.redraw();
    expect(vnode.redraw).toHaveBeenCalled();
  });
});
