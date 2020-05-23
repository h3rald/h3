const h3 = require("../h3.js").default;

let preStartCalled = false;
let postStartCalled = false;
let count = 0;
let result = 0;

const setCount = () => {
  count = count + 2;
  h3.dispatch("count/set", count);
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
const $onrender = (node) => {
  node.classList.add("test");
};
const C1 = () => {
  const parts = h3.route.parts;
  const content = Object.keys(parts).map((key) =>
    h3("li", `${key}: ${parts[key]}`)
  );
  return h3("ul.c1", { $onrender }, content);
};

const C2 = () => {
  const params = h3.route.params;
  const content = Object.keys(params).map((key) =>
    h3("li", `${key}: ${params[key]}`)
  );
  return h3("ul.c2", { $onrender }, content);
};

describe("h3 (Router)", () => {
  beforeEach(async () => {
    const preStart = () => (preStartCalled = true);
    const postStart = () => (postStartCalled = true);
    await h3.init({
      routes: {
        "/c1/:a/:b/:c": C1,
        "/c2": C2,
      },
      location: mockLocation,
      preStart: preStart,
      postStart: postStart,
    });
  });

  it("should support routing configuration at startup", () => {
    expect(h3.route.def).toEqual("/c2");
  });

  it("should support pre/post start hooks", () => {
    expect(preStartCalled).toEqual(true);
    expect(postStartCalled).toEqual(true);
  });

  it("should support the capturing of parts within the current route", (done) => {
    const sub = h3.on("$redraw", () => {
      expect(document.body.childNodes[0].childNodes[1].textContent).toEqual(
        "b: 2"
      );
      expect(document.body.childNodes[0].classList.contains("test")).toEqual(
        true
      );
      sub();
      done();
    });
    mockLocation.hash = "#/c1/1/2/3";
  });

  it("should expose a navigateTo method to navigate to another path", (done) => {
    const sub = h3.on("$redraw", () => {
      expect(document.body.childNodes[0].childNodes[1].textContent).toEqual(
        "test2: 2"
      );
      sub();
      done();
    });
    h3.navigateTo("/c2", { test1: 1, test2: 2 });
  });

  it("should throw an error if no route matches", async () => {
    try {
      await h3.init({
        element: document.body,
        routes: {
          "/c1/:a/:b/:c": () => h3("div"),
          "/c2": () => h3("div"),
        },
      });
    } catch (e) {
      expect(e.message).toMatch(/No route matches/);
    }
  });

  it("should execute $onrender callback after each navigation", async () => {
    let executions = [];
    let count = 0;
    const c = () => {
      return h3(
        "div",
        {
          $onrender: (node) => {
            executions.push("test1");
          },
        },
        [
          h3("span", {
            $onrender: (node) => {
              executions.push("test2");
            },
          }),
        ]
      );
    };
    expect(executions).toEqual([]);
    await h3.init({
      element: document.body,
      routes: { "/": c },
    });
    expect(executions).toEqual(["test2", "test1"]);
  });

  it("should execute setup and teardown methods", (done) => {
    let redraws = 0;
    C1.setup = (cstate) => {
      cstate.result = cstate.result || 0;
      cstate.sub = h3.on("count/set", (state, count) => {
        cstate.result = count * count;
      });
    };
    C1.teardown = (cstate) => {
      cstate.sub();
      result = cstate.result;
      return { result: cstate.result };
    };
    const sub = h3.on("$redraw", () => {
      redraws++;
      setCount();
      setCount();
      if (redraws === 1) {
        expect(count).toEqual(4);
        expect(result).toEqual(0);
        h3.navigateTo("/c2");
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
    h3.navigateTo("/c1/a/b/c");
  });
});
