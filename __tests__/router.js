const Router = require("../router.js").Router;
const h = require("../vdom.js").h;
const Store = require("../store.js").Store;

let preStartCalled = false;
let postStartCalled = false;
let count = 0;
let result = 0;
let store;
let router;

const setCount = () => {
  count = count + 2;
  store.dispatch("count/set", count);
};
let hash = "#/c2";
const mockLocation = {
  get hash() {
    return hash;
  },
  set hash(value) {
    const event = new CustomEvent("hashchange");
    event.oldURL = hash;
    event.newURL = value;
    hash = value;
    window.dispatchEvent(event);
  },
};
const C1 = () => {
  const parts = router.route.parts;
  const content = Object.keys(parts).map((key) =>
    h("li", `${key}: ${parts[key]}`)
  );
  return h("ul.c1", content);
};

let c2Redraws = 0;

const C2 = () => {
  const params = router.route.params;
  const content = Object.keys(params).map((key) =>
    h("li", `${key}: ${params[key]}`)
  );
  c2Redraws = c2Redraws+1;
  return h("ul.c2", content);
};

describe("Router", () => {
  beforeEach(async () => {
    store = new Store();
    router = new Router({
      routes: {
        "/c1/:a/:b/:c": C1,
        "/c2": C2,
      },
      store,
      location: mockLocation,
    });
    await router.start();
  });

  afterEach(() => {
    mockLocation.hash = "#/c2";
    c2Redraws = 0;
  })

  it("should throw an error if no routes are defined", () => {
    expect(() => new Router({})).toThrowError(/no routes/i);
  });

  it("should redraw the current component when needed", () => {
    router.redraw();
    router.redraw();
    expect(c2Redraws).toEqual(3);
  });

  it("should not navigate if no route match", () => {
    router.navigateTo("/unknown");
    expect(router.route.path).toEqual("/c2");
  });

  it("should support routing configuration at startup", () => {
    expect(router.route.def).toEqual("/c2");
  });

  it("should support the capturing of parts within the current route", (done) => {
    const sub = store.on("$redraw", () => {
      expect(document.body.childNodes[0].childNodes[1].textContent).toEqual(
        "b: 2"
      );
      sub();
      done();
    });
    mockLocation.hash = "#/c1/1/2/3";
  });

  it("should expose a navigateTo method to navigate to another path", (done) => {
    const sub = store.on("$redraw", () => {
      expect(document.body.childNodes[0].childNodes[1].textContent).toEqual(
        "test2: 2"
      );
      sub();
      done();
    });
    router.navigateTo("/c2", { test1: 1, test2: 2 });
  });

  it("should throw an error if no route matches", async () => {
    try {
      new Router({
        element: document.body,
        routes: {
          "/c1/:a/:b/:c": () => h("div"),
          "/c2": () => h("div"),
        },
      });
    } catch (e) {
      expect(e.message).toMatch(/No route matches/);
    }
  });

  it("should execute setup and teardown methods", (done) => {
    let redraws = 0;
    C1.setup = (cstate) => {
      cstate.result = cstate.result || 0;
      cstate.sub = store.on("count/set", (state, count) => {
        cstate.result = count * count;
      });
    };
    C1.teardown = (cstate) => {
      cstate.sub();
      result = cstate.result;
      return { result: cstate.result };
    };
    const sub = store.on("$redraw", () => {
      redraws++;
      setCount();
      setCount();
      if (redraws === 1) {
        expect(count).toEqual(4);
        expect(result).toEqual(0);
        router.navigateTo("/c2");
      }
      if (redraws === 2) {
        expect(count).toEqual(8);
        expect(result).toEqual(16);
        delete C1.setup;
        delete C1.teardown;
        sub();
        done();
      }
    });
    router.navigateTo("/c1/a/b/c");
  });
});
