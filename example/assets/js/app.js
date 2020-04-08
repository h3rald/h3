import h3 from "./h3.js";
import Paginator from "./paginator.js";
import Todo from "./todo.js";

export default function App(container) {
  const self = this; // get the right self... when function are passed as event handlers it changes.
  self.container = container;
  self.todos = [];
  self.filteredTodos = [];
  self.view = null;
  self.emptyTodoError = false;
  self.filter = "";
  self.pagesize = 10;
  self.page = 1;

  // State management via localStorage
  self.save = () => {
    localStorage.setItem("h3_todo_list", JSON.stringify(self.todos));
  };
  self.load = () => {
    const todos = localStorage.getItem("h3_todo_list");
    if (todos) {
      self.todos = JSON.parse(todos);
    }
  };

  // Todo component
  self.todo = h3.component(new Todo(self));
  // Paginator Component
  self.paginator = h3.component(new Paginator(self));

  // Actual DOM creation/redrawing
  self.redraw = () => {
    self.save();
    const newTree = self.render();
    h3.redraw(self.container.childNodes[0], newTree, self.view);
    self.view = newTree;
  };

  // UI Methods
  // Add a todo item
  self.addTodo = () => {
    const newTodo = document.getElementById("new-todo");
    if (!newTodo.value) {
      self.emptyTodoError = true;
      self.redraw();
      document.getElementById("new-todo").focus();
      return;
    }
    self.emptyTodoError = false;
    self.todos.unshift({
      key: `todo_${Date.now()}__${newTodo.value}`, // Make todos "unique-enough" to ensure they are processed correctly
      text: newTodo.value,
    });
    newTodo.value = "";
    self.redraw();
    document.getElementById("new-todo").focus();
  };

  // Add a todo item when pressing enter in the input field.
  self.addTodoOnEnter = (event) => {
    if (event.keyCode == 13) {
      self.addTodo();
      event.preventDefault();
    }
  };

  // Set the todo filter.
  self.setFilter = (event) => {
    let filter = document.getElementById("filter-text");
    self.filter = filter.value;
    self.redraw();
    filter = document.getElementById("filter-text");
    filter.focus();
  };

  // Display todo items
  self.displayTodos = () => {
    const start = (self.page - 1) * self.pagesize;
    const end = Math.min(start + self.pagesize, self.filteredTodos.length);
    return self.filteredTodos.slice(start, end).map(self.todo);
  };

  // Clear error message
  self.clearError = () => {
    self.emptyTodoError = false;
    self.redraw();
    document.getElementById("new-todo").focus();
  };

  // Filtering function for todo items
  self.filterTodos = ({ text }) => text.match(self.filter);

  // Main rendering function (creates virtual dom)
  self.render = () => {
    const hash = window.location.hash;
    self.filteredTodos = self.todos.filter(self.filterTodos);
    if (hash.match(/page=(\d+)/)) {
      self.page = parseInt(hash.match(/page=(\d+)/)[1]);
    }
    // Recalculate page in case data is filtered.
    self.page =
      Math.min(
        Math.ceil(self.filteredTodos.length / self.pagesize),
        self.page
      ) || 1;
    const emptyTodoErrorClass = self.emptyTodoError ? "" : ".hidden";
    const paginatorData = {
      size: self.pagesize,
      page: self.page,
      total: self.filteredTodos.length,
    };
    return h3("div.todo-list-container", [
      h3("h1", ["To Do List"]),
      h3("form.add-todo-form", [
        h3("input", {
          id: "new-todo",
          placeholder: "What do you want to do?",
          autofocus: true,
          onkeydown: self.addTodoOnEnter,
        }),
        h3("span.submit-todo.fas.fa-plus-circle", {
          onclick: self.addTodo,
        }),
      ]),
      h3(`div.error${emptyTodoErrorClass}`, [
        h3("span.error-message", ["Please enter a non-empty todo item."]),
        h3("span.dismiss-error.fas.fa-times", {
          onclick: self.clearError,
        }),
      ]),
      h3("div.navigation-bar", [
        h3("input", {
          id: "filter-text",
          placeholder: "Type to filter todo items...",
          onkeyup: self.setFilter,
          value: self.filter,
        }),
        self.paginator(paginatorData),
      ]),
      h3("div.todo-list", self.displayTodos()),
    ]);
  };
  self.init = () => {
    self.load();
    self.view = self.render();
    self.container.appendChild(h3.render(self.view));
  };
  // Initialize...
  self.init();
}
new App(document.getElementById("app"));
