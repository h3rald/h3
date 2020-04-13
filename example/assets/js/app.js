import h3, { createApp } from "./h3.js";
import AddTodoForm from "./components/addTodoForm.js";
import EmptyTodoError from "./components/emptyTodoError.js";
import NavigationBar from "./components/navigationBar.js";
import TodoList from "./components/todoList.js";
import store from "./store.js";

const app = () => {
  const { todos, filteredTodos, filter } = store.get();
  store.dispatch("todos/filter", filter);
  localStorage.setItem("h3_todo_list", JSON.stringify(todos));
  return h3("div#todolist.todo-list-container", [
    h3("h1", "To Do List"),
    h3("main", [
      AddTodoForm,
      EmptyTodoError,
      h3("div#main-area", [NavigationBar, TodoList])
    ])
  ]);
}

store.dispatch("todos/load");

const update = createApp('app', app);

store.on('$update', update);