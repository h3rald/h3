/**
 * The code of the following class is heavily based on Storeon
 * Modified according to the terms of the MIT License
 * <https://github.com/storeon/storeon/blob/master/LICENSE>
 * Copyright 2019 Andrey Sitnik <andrey@sitnik.ru>
 */
export class Store {
  constructor() {
    this.events = {};
    this.state = {};
  }
  dispatch(event, data) {
    if (event !== "$log") this.dispatch("$log", { event, data });
    if (this.events[event]) {
      let changes = {};
      let changed;
      this.events[event].forEach((i) => {
        this.state = { ...this.state, ...i(this.state, data) };
      });
    }
  }

  on(event, cb) {
    (this.events[event] || (this.events[event] = [])).push(cb);

    return () => {
      this.events[event] = this.events[event].filter((i) => i !== cb);
    };
  }
}