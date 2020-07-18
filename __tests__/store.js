const Store = require("../store.js").Store;

let store;

describe("Store", () => {
  beforeEach(() => {
    store = new Store();
    store.on("$init", () => ({ online: true }));
    store.on("$stop", () => ({ online: false }));
    store.on("online/set", (state, data) => ({ online: data }));
    store.dispatch("$init");
  });

  afterEach(() => {
    store.dispatch("$stop");
  });

  it("should expose a method to retrieve the application state", () => {
    expect(store.state.online).toEqual(true);
  });

  it("should expose a method to dispatch messages", () => {
    expect(store.state.online).toEqual(true);
    store.dispatch("online/set", "YEAH!");
    expect(store.state.online).toEqual("YEAH!");
  });

  it("should expose a method to subscribe to messages (and also cancel subscriptions)", () => {
    const sub = store.on("online/clear", () => ({ online: undefined }));
    store.dispatch("online/clear");
    expect(store.state.online).toEqual(undefined);
    store.dispatch("online/set", "reset");
    expect(store.state.online).toEqual("reset");
    sub();
    store.dispatch("online/clear");
    expect(store.state.online).toEqual("reset");
  });
});
