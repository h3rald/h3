const mod = require("../h3.js");
const h3 = mod.h3;
const h = mod.h;

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
    const v1 = h("div", { onclick: () => true });
    const v2 = h("div", { onclick: () => true });
    const v3 = h("div", { onclick: () => false });
    const v4 = h("div");
    expect(v1.equal(v2)).toEqual(true);
    expect(v1.equal(v3)).toEqual(false);
    expect(v4.equal({ type: "div" })).toEqual(false);
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
    const c = () => h("div", "Hello, World!");
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
    const vnode = h("div");
    await h3.init(() => vnode);
    jest.spyOn(vnode, "redraw");
    h3.redraw();
    expect(vnode.redraw).toHaveBeenCalled();
    h3.redraw(true);
    h3.redraw();
    h3.redraw();
    expect(vnode.redraw).toHaveBeenCalledTimes(2);
  });

  it("should not redraw while a other redraw is in progress", async () => {
    const vnode = h("div");
    await h3.init({
      routes: {
        "/": () => vnode,
      },
    });
    jest.spyOn(vnode, "redraw");
    h3.redraw(true);
    h3.redraw();
    expect(vnode.redraw).toHaveBeenCalledTimes(1);
  });

  it("should expose a screen method to define screen-level components with (optional) setup and teardown", async () => {
    expect(() => h3.screen({})).toThrowError(/No display property specified/);
    expect(() => h3.screen({ setup: 1, display: () => "" })).toThrowError(
      /setup property is not a function/
    );
    expect(() => h3.screen({ teardown: 1, display: () => "" })).toThrowError(
      /teardown property is not a function/
    );
    let s = h3.screen({ display: () => "test" });
    expect(typeof s).toEqual("function");
    s = h3.screen({
      display: () => "test",
      setup: (state) => state,
      teardown: (state) => state,
    });
    expect(typeof s.setup).toEqual("function");
    expect(typeof s.teardown).toEqual("function");
  });
});
