import h3, { mount } from "./h3.js";
import Paginator from "./paginator.js";
import Todo from "./todo.js";

let todos = [];
let filteredTodos = [];
let app;
let emptyTodoError = false;
let filter = "";
let pagesize = 10;
let page = 1;

// State management via localStorage
const save = () => {
  localStorage.setItem("h3_todo_list", JSON.stringify(todos));
};
const load = () => {
  const lsTodos = localStorage.getItem("h3_todo_list");
  if (lsTodos) {
    todos = JSON.parse(lsTodos);
  }
};

// Actual DOM creation/updateing
const update = () => {
  save();
  app.update({ vnode: build() });
};

const toggle = (todo) => {
  todo.done = !todo.done;
  update();
};
const remove = (todo) => {
  todos = todos.filter(({ key }) => key !== todo.key);
  update();
};

// UI Methods
// Add a todo item
const addTodo = () => {
  const newTodo = document.getElementById("new-todo");
  if (!newTodo.value) {
    emptyTodoError = true;
    update();
    document.getElementById("new-todo").focus();
    return;
  }
  emptyTodoError = false;
  todos.unshift({
    key: `todo_${Date.now()}__${newTodo.value}`, // Make todos "unique-enough" to ensure they are processed correctly
    text: newTodo.value,
  });
  newTodo.value = "";
  update();
  document.getElementById("new-todo").focus();
};

// Add a todo item when pressing enter in the input field.
const addTodoOnEnter = (event) => {
  if (event.keyCode == 13) {
    addTodo();
    event.preventDefault();
  }
};

// Set the todo filter.
const setFilter = (event) => {
  let f = document.getElementById("filter-text");
  filter = f.value;
  update();
  f = document.getElementById("filter-text");
  f.focus();
};

// Display todo items
const displayTodos = () => {
  const start = (page - 1) * pagesize;
  const end = Math.min(start + pagesize, filteredTodos.length);
  return filteredTodos.slice(start, end).map((t) => Todo(t, {toggle, remove}));
};

// Clear error message
const clearError = () => {
  emptyTodoError = false;
  update();
  document.getElementById("new-todo").focus();
};

// Filtering function for todo items
const filterTodos = ({ text }) => text.match(filter);

// Main rendering function (creates virtual dom)
const build = () => {
  const hash = window.location.hash;
  filteredTodos = todos.filter(filterTodos);
  if (hash.match(/page=(\d+)/)) {
    page = parseInt(hash.match(/page=(\d+)/)[1]);
  }
  // Recalculate page in case data is filtered.
  page = Math.min(Math.ceil(filteredTodos.length / pagesize), page) || 1;
  const emptyTodoErrorClass = emptyTodoError ? "" : ".hidden";
  const paginatorData = {
    size: pagesize,
    page: page,
    total: filteredTodos.length,
  };
  return h3("div#todolist.todo-list-container", [
    h3("h1", ["To Do List"]),
    h3("form.add-todo-form", [
      h3("input", {
        id: "new-todo",
        placeholder: "What do you want to do?",
        autofocus: true,
        onkeydown: addTodoOnEnter,
      }),
      h3(
        "span.submit-todo",
        {
          onclick: addTodo,
        },
        ["+"]
      ),
    ]),
    h3(`div.error${emptyTodoErrorClass}`, [
      h3("span.error-message", ["Please enter a non-empty todo item."]),
      h3(
        "span.dismiss-error",
        {
          onclick: clearError,
        },
        ["✘"]
      ),
    ]),
    h3("div.navigation-bar", [
      h3("input", {
        id: "filter-text",
        placeholder: "Type to filter todo items...",
        onkeyup: setFilter,
        value: filter,
      }),
      Paginator(paginatorData, {update}),
    ]),
    h3("div.todo-list", displayTodos()),
  ]);
};
load();
app = build();
mount("app", app);
