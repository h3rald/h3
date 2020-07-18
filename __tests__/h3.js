const h3 = require("../h3.js").default;
const h = require("../h3.js").h;

describe("h3", () => {
  beforeEach(() => {
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb) => cb());
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
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

  it("should expose common high-level methods", async (done) => {
    let called = false;
    let pre = false;
    let post = false;
    const vnode = h("div");
    await h3.init({
      routes: {
        "/aaa": () => vnode,
        "/": () => vnode,
      },
      preStart: () => (pre = true),
      postStart: () => (post = true),
      modules: [
        (store) =>
          store.on("test", (state) => {
            called = true;
            return { test: true };
          }),
      ],
    });
    h3.dispatch("test");
    expect(h3.state).toEqual({ test: true });
    expect(called).toEqual(true);
    expect(pre).toEqual(true);
    expect(post).toEqual(true);
    const sub = h3.on("$redraw", () => {
      expect(h3.route.def).toEqual("/aaa");
      sub();
      done();
    });
    h3.navigateTo("/aaa");
  });
});
