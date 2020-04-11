import { createStore } from "./h3.js";

const todos = (store) => {
  store.on("init", () => ({ todos: [], filteredTodos: [], filter: "" }));
};

const flags = (store) => {
  store.on("init", () => ({ displayEmptyTodoError: false }));
  store.on("emptyTodoError.clear", (state) => ({ displayEmptyTodoError: false }));
  store.on("emptyTodoError.set", (state) => ({ displayEmptyTodoError: true }));
};

const pages = (store) => {
  store.on("init", () => ({ pagesize: 10, page: 1 }));
};

const store = createStore([todos, flags, pages]);

store.dispatch("init");

export default store;
