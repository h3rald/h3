import h3 from "../h3.js";
import store from "../store.js";

export default function Todo(data) {
  const todoStateClass = data.done ? ".done" : ".todo";
  const toggleTodo = (todo) => {
    store.dispatch("todos/toggle", data);
    store.dispatch("$update");
  };
  const removeTodo = (todo) => {
    store.dispatch("todos/remove", data);
    store.dispatch("$update");
  };
  return h3(`div#${data.key}.todo-item`, [
    h3(`div.todo-content${todoStateClass}`, [
      h3("span.todo-text", { onclick: () => toggleTodo(data) }, data.text),
    ]),
    h3("span.delete-todo", { onclick: () => removeTodo(data) }, "✘"),
  ]);
}
