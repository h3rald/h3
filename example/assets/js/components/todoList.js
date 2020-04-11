import h3 from "../h3.js";
import Todo from "./todo.js";
import store from "../store.js";

export default function TodoList() {
  const { page, pagesize } = store.get();
  const filteredTodos = store.get('filteredTodos');
  const start = (page - 1) * pagesize;
  const end = Math.min(start + pagesize, filteredTodos.length);
  return h3(
    "div.todo-list",
    filteredTodos.slice(start, end).map((t) => Todo(t))
  );
}
