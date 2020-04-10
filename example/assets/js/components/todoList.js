import h3 from "../h3.js";
import Todo from "./todo.js";

export default function TodoList(data, actions) {
  const { start, end, filteredTodos } = data;
  const { toggleTodo, removeTodo } = actions;
  return h3(
    "div.todo-list",
    filteredTodos
      .slice(start, end)
      .map((t) => Todo(t, { toggleTodo, removeTodo }))
  );
}
