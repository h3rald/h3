import h3 from "../h3.js";

export default function Todo(data) {
  const todoStateClass = data.done ? ".done" : ".todo";
  const toggleTodo = (todo) => {
    h3.dispatch("todos/toggle", data);
    h3.redraw()
  };
  const removeTodo = (todo) => {
    h3.dispatch("todos/remove", data);
    h3.redraw()
  };
  return h3(`div.todo-item`, {$key: data.key}, [
    h3(`div.todo-content${todoStateClass}`, [
      h3("span.todo-text", { onclick: () => toggleTodo(data) }, data.text),
    ]),
    h3("span.delete-todo", { onclick: () => removeTodo(data) }, "✘"),
  ]);
}
