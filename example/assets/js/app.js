import h3 from "./h3.js";
import AddTodoForm from "./components/addTodoForm.js";
import EmptyTodoError from "./components/emptyTodoError.js";
import NavigationBar from "./components/navigationBar.js";
import TodoList from "./components/todoList.js";
import modules from "./modules.js";

let initialized = false;

const MainView = () => {
  if (!initialized) {
    h3.dispatch("todos/load");
  }
  initialized = true;
  const { todos, filteredTodos, filter } = h3.state();
  h3.dispatch("todos/filter", filter);
  localStorage.setItem("h3_todo_list", JSON.stringify(todos));
  return h3("div.todo-list-container", [
    h3("h1", "To Do List"),
    h3("main", [AddTodoForm, EmptyTodoError, NavigationBar, TodoList]),
  ]);
};

const SettingsView = () => {
  return h3("div.settings", [
    h3("h1", "Settings"),
    h3(
      "a.nav-link",
      {
        onclick: () => h3.go("/"),
      },
      "← Go Back"
    ),
  ]);
};

h3.init({
  element: document.getElementById("app"),
  modules,
  routes: {
    "/settings": SettingsView,
    "/": MainView,
  },
});
