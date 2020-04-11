import { createStore } from "./h3.js";

const todos = (store) => {
  store.on("init", () => ({ todos: [], filteredTodos: [], filter: "" }));
  store.on("todos/add", (state, data) => {
    let todos = state.todos;
    todos.unshift({
      key: `todo_${Date.now()}__${data.text}`, // Make todos "unique-enough" to ensure they are processed correctly
      text: data.text,
    });
    return { todos };
  });
  store.on("todos/load", () => {
    const storedTodos = localStorage.getItem("h3_todo_list");
    const todos = storedTodos ? JSON.parse(storedTodos) : [];
    return { todos };
  });
  store.on("todos/remove", (state, data) => {
    const todos = state.todos.filter(({ key }) => key !== data.key);
    return { todos };
  });
  store.on("todos/toggle", (state, data) => {
    const todos = state.todos;
    const todo = state.todos.find((t) => t.key === data.key);
    todo.done = !todo.done;
    return { todos };
  });
  store.on("todos/filter", (state, filter) => {
    const todos = state.todos;
    const filteredTodos = todos.filter(({ text }) => text.match(filter));
    return { filteredTodos, filter };
  });
};

const error = (store) => {
  store.on("init", () => ({ displayEmptyTodoError: false }));
  store.on("error/clear", (state) => ({ displayEmptyTodoError: false }));
  store.on("error/set", (state) => ({ displayEmptyTodoError: true }));
};

const pages = (store) => {
  store.on("init", () => ({ pagesize: 10, page: 1 }));
  store.on("pages/set", (state, page) => ({ page }));
};

const store = createStore([todos, error, pages]);

store.dispatch("init");

export default store;
