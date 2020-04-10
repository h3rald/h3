import h3, { mount } from "./h3.js";
import AddTodoForm from "./components/addTodoForm.js";
import EmptyTodoError from "./components/emptyTodoError.js";
import NavigationBar from "./components/navigationBar.js";
import TodoList from "./components/todoList.js";

let todos = [];
let filteredTodos = [];
let app;
let displayEmptyTodoError = false;
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

// UI Methods
// Add a todo item
const addTodo = () => {
  const newTodo = document.getElementById("new-todo");
  if (!newTodo.value) {
    displayEmptyTodoError = true;
    update();
    document.getElementById("new-todo").focus();
    return;
  }
  displayEmptyTodoError = false;
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

const toggleTodo = (todo) => {
  todo.done = !todo.done;
  update();
};
const removeTodo = (todo) => {
  todos = todos.filter(({ key }) => key !== todo.key);
  update();
};

// Set the todo filter.
const setFilter = (event) => {
  let f = document.getElementById("filter-text");
  filter = f.value;
  update();
  f = document.getElementById("filter-text");
  f.focus();
};

// Clear error message
const clearError = () => {
  displayEmptyTodoError = false;
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
  const paginatorData = {
    size: pagesize,
    page: page,
    total: filteredTodos.length,
  };
  const start = (page - 1) * pagesize;
  const end = Math.min(start + pagesize, filteredTodos.length);
  return h3("div#todolist.todo-list-container", [
    h3("h1", ["To Do List"]),
    AddTodoForm({ addTodo, addTodoOnEnter }),
    EmptyTodoError({ displayEmptyTodoError }, { clearError }),
    NavigationBar({ filter, paginatorData }, { update, setFilter }),
    TodoList({ filteredTodos, start, end }, { toggleTodo, removeTodo }),
  ]);
};
load();
app = build();
mount("app", app);
