import h3, { createRegion, createRouter, createApp } from "./h3.js";
import AddTodoForm from "./components/addTodoForm.js";
import EmptyTodoError from "./components/emptyTodoError.js";
import NavigationBar from "./components/navigationBar.js";
import TodoList from "./components/todoList.js";
import store from "./store.js";

const app = () => {
  return h3("div#todolist.todo-list-container", [
    h3("h1", "To Do List"),
    h3("div#main-view"),
  ]);
};

const main = () => {
  const { todos, filteredTodos, filter } = store.get();
  const [error, updateError] = createRegion(EmptyTodoError);
  store.on("error/update", updateError);
  const [mainArea, updateMainArea] = createRegion(() => {
    store.dispatch("todos/filter", filter);
    localStorage.setItem("h3_todo_list", JSON.stringify(todos));
    return h3("div#main-area", [NavigationBar(), TodoList()]);
  });
  store.on("mainArea/update", () => {
    updateMainArea();
  });
  return h3("main", [
    AddTodoForm(),
    error,
    mainArea
  ]);
}

store.dispatch("todos/load");

createApp('app', app());

export const router = createRouter({
  fallback: "/",
  id: "main-view",
  routes: {
    "/": main(),
  },
});

router.start();

if (router.route.params.log) {
  store.on("log", (state, data) => console.log(data, state));
}
