const h3 = require("../h3.js").default;

let preStartCalled = false;
let postStartCalled = false;

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

describe("h3 (Router)", () => {
  beforeEach(async () => {
    const preStart = () => (preStartCalled = true);
    const postStart = () => (postStartCalled = true);
    const C1 = () => {
      const parts = h3.route.parts;
      const content = Object.keys(parts).map((key) =>
        h3("li", `${key}: ${parts[key]}`)
      );
      return h3("ul.c1", content);
    };
    const C2 = () => {
      const params = h3.route.params;
      const content = Object.keys(params).map((key) =>
        h3("li", `${key}: ${params[key]}`)
      );
      return h3("ul.c2", content);
    };
    return await h3.init({
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

  it("should support the capturing of parts within the current route", () => {
    mockLocation.hash = "#/c1/1/2/3";
    expect(document.body.childNodes[0].childNodes[1].textContent).toEqual(
      "b: 2"
    );
  });

  it("should expose a navigateTo method to navigate to another path", () => {
    h3.navigateTo("/c2", { test1: 1, test2: 2 });
    expect(document.body.childNodes[0].childNodes[1].textContent).toEqual(
      "test2: 2"
    );
    h3.navigateTo("/c2");
    expect(document.body.childNodes[0].innerHTML).toEqual("");
  });

  it("should fail if no route matches at startup", async () => {
    mockLocation.hash = "#/test";
    try {
      await h3.init({
        element: document.body,
        routes: { "/aaa": () => false },
      });
    } catch (e) {
      expect(e.message).toMatch(/No route matches/);
    }
  });
});
