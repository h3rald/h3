import { h3, h } from "../h3.js";
import AddTodoForm from "./AddTodoForm.js";
import EmptyTodoError from "./EmptyTodoError.js";
import NavigationBar from "./NavigationBar.js";
import TodoList from "./TodoList.js";

export default function () {
  const { todos, filter } = h3.state;
  h3.dispatch("todos/filter", filter);
  h3.dispatch("app/save", { todos: todos, settings: h3.state.settings });
  return h("div.container", [
    h("h1", "To Do List"),
    h("main", [AddTodoForm, EmptyTodoError, NavigationBar, TodoList]),
  ]);
}
