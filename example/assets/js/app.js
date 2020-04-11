import h3, { mount, region } from "./h3.js";
import AddTodoForm from "./components/addTodoForm.js";
import EmptyTodoError from "./components/emptyTodoError.js";
import NavigationBar from "./components/navigationBar.js";
import TodoList from "./components/todoList.js";
import store from "./store.js";

//store.on("log", (state, data) => console.log(data, state));

// Main rendering function (creates virtual dom)
const build = () => {
  const { todos, filteredTodos, filter } = store.get();
  localStorage.setItem("h3_todo_list", JSON.stringify(todos));
  store.dispatch("todos/filter", filter);
  const [error, updateError] = region(EmptyTodoError);
  store.on("error/update", updateError);
  return h3("div#todolist.todo-list-container", [
    h3("h1", "To Do List"),
    AddTodoForm(),
    error,
    NavigationBar(),
    TodoList(),
  ]);
};

store.dispatch("todos/load");

const [app, update] = region(build);

store.on("app/update", update);

mount("app", app);
