const app = (store) => {
  store.on("app/load", () => {
    const storedData = localStorage.getItem("h3_todo_list");
    const { todos, settings } = storedData ? JSON.parse(storedData) : {todos: [], settings: {}};
    return { todos, settings };
  });
  store.on("app/save", (state, data) => {
    localStorage.setItem(
      "h3_todo_list",
      JSON.stringify({ todos: state.todos, settings: state.settings })
    );
  });
};

const settings = (store) => {
  let removeSubscription;
  store.on("$init", () => ({ settings: {} }));
  store.on("settings/set", (state, data) => {
    if (data.logging) {
      removeSubscription = store.on("$log", (state, data) => console.log(data));
    } else {
      removeSubscription && removeSubscription();
    }
    return { settings: data };
  });
};

const todos = (store) => {
  store.on("$init", () => ({ todos: [], filteredTodos: [], filter: "" }));
  store.on("todos/add", (state, data) => {
    let todos = state.todos;
    todos.unshift({
      key: data.key,
      text: data.text,
    });
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
  store.on("$init", () => ({ displayEmptyTodoError: false }));
  store.on("error/clear", (state) => ({ displayEmptyTodoError: false }));
  store.on("error/set", (state) => ({ displayEmptyTodoError: true }));
};

const pages = (store) => {
  store.on("$init", () => ({ pagesize: 10, page: 1 }));
  store.on("pages/set", (state, page) => ({ page }));
};

export default [app, todos, error, pages, settings];
