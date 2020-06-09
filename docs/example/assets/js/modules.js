import h3 from "./h3.js";

const app = () => {
  h3.on("app/load", () => {
    const storedData = localStorage.getItem("h3_todo_list");
    const { todos, settings } = storedData
      ? JSON.parse(storedData)
      : { todos: [], settings: {} };
    return { todos, settings };
  });
  h3.on("app/save", (state, data) => {
    localStorage.setItem(
      "h3_todo_list",
      JSON.stringify({ todos: state.todos, settings: state.settings })
    );
  });
};

const settings = () => {
  let removeSubscription;
  h3.on("$init", () => ({ settings: {} }));
  h3.on("settings/set", (state, data) => {
    if (data.logging) {
      removeSubscription = h3.on("$log", (state, data) => console.log(data));
    } else {
      removeSubscription && removeSubscription();
    }
    return { settings: data };
  });
};

const todos = () => {
  h3.on("$init", () => ({ todos: [], filteredTodos: [], filter: "" }));
  h3.on("todos/add", (state, data) => {
    let todos = state.todos;
    todos.unshift({
      key: data.key,
      text: data.text,
    });
    return { todos };
  });
  h3.on("todos/remove", (state, k) => {
    const todos = state.todos.filter(({ key }) => key !== k);
    return { todos };
  });
  h3.on("todos/toggle", (state, k) => {
    const todos = state.todos;
    const todo = state.todos.find(({ key }) => key === k);
    todo.done = !todo.done;
    return { todos };
  });
  h3.on("todos/filter", (state, filter) => {
    const todos = state.todos;
    const filteredTodos = todos.filter(({ text }) => text.match(filter));
    return { filteredTodos, filter };
  });
};

const error = () => {
  h3.on("$init", () => ({ displayEmptyTodoError: false }));
  h3.on("error/clear", (state) => ({ displayEmptyTodoError: false }));
  h3.on("error/set", (state) => ({ displayEmptyTodoError: true }));
};

const pages = () => {
  h3.on("$init", () => ({ pagesize: 10, page: 1 }));
  h3.on("pages/set", (state, page) => ({ page }));
};

export default [app, todos, error, pages, settings];
