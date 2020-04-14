import h3 from "../h3.js";
import AddTodoForm from "./AddTodoForm.js";
import EmptyTodoError from "./EmptyTodoError.js";
import NavigationBar from "./NavigationBar.js";
import TodoList from "./TodoList.js";

export default function () {
  const { todos, filter } = h3.state();
  h3.dispatch("todos/filter", filter);
  h3.dispatch("app/save", { todos: todos, settings: h3.state("settings") });
  return h3("div.container", [
    h3("h1", "To Do List"),
    h3("main", [AddTodoForm, EmptyTodoError, NavigationBar, TodoList]),
  ]);
}
