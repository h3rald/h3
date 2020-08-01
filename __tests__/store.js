const mod = require("../h3.js");
const h3 = mod.h3;
const h = mod.h;

describe("h3 (Store)", () => {
    beforeEach(async () => {
        const test = () => {
            h3.on("$init", () => ({ online: true }));
            h3.on("$stop", () => ({ online: false }));
            h3.on("online/set", (state, data) => ({ online: data }));
        };
        return await h3.init({
            modules: [test],
            routes: { "/": () => h("div") },
        });
    });

    afterEach(() => {
        h3.dispatch("$stop");
    });

    it("should expose a method to retrieve the application state", () => {
        expect(h3.state.online).toEqual(true);
    });

    it("should expose a method to dispatch messages", () => {
        expect(h3.state.online).toEqual(true);
        h3.dispatch("online/set", "YEAH!");
        expect(h3.state.online).toEqual("YEAH!");
    });

    it("should expose a method to subscribe to messages (and also cancel subscriptions)", () => {
        const sub = h3.on("online/clear", () => ({ online: undefined }));
        h3.dispatch("online/clear");
        expect(h3.state.online).toEqual(undefined);
        h3.dispatch("online/set", "reset");
        expect(h3.state.online).toEqual("reset");
        sub();
        h3.dispatch("online/clear");
        expect(h3.state.online).toEqual("reset");
    });
});
