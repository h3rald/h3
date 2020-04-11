import h3, { mount, region } from "./h3.js";
import AddTodoForm from "./components/addTodoForm.js";
import EmptyTodoError from "./components/emptyTodoError.js";
import NavigationBar from "./components/navigationBar.js";
import TodoList from "./components/todoList.js";
import store from "./store.js";

//store.on("log", (state, data) => console.log(data, state));

const app = () => {
  const { todos, filteredTodos, filter } = store.get();
  const [error, updateError] = region(EmptyTodoError);
  store.on("error/update", updateError);
  const [mainArea, updateMainArea] = region(() => {
    store.dispatch("todos/filter", filter);
    localStorage.setItem("h3_todo_list", JSON.stringify(todos));
    return h3("div#main-area", [NavigationBar(), TodoList()]);
  });
  store.on("mainArea/update", () => {
    updateMainArea();
  });
  return h3("div#todolist.todo-list-container", [
    h3("h1", "To Do List"),
    AddTodoForm(),
    error,
    mainArea,
  ]);
};

store.dispatch("todos/load");
mount("app", app());
