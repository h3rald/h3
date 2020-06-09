import h3 from "../h3.js";

export default function Todo(data) {
  const todoStateClass = data.done ? ".done" : ".todo";
  const toggleTodo = (key) => {
    h3.dispatch("todos/toggle", key);
    h3.redraw();
  };
  const removeTodo = (key) => {
    h3.dispatch("todos/remove", key);
    h3.redraw();
  };
  return h3(`div.todo-item`, { data: { key: data.key } }, [
    h3(`div.todo-content${todoStateClass}`, [
      h3("span.todo-text", { onclick: (e) => toggleTodo(e.currentTarget.parentNode.parentNode.dataset.key) }, data.text),
    ]),
    h3("span.delete-todo", { onclick: (e) => removeTodo(e.currentTarget.parentNode.dataset.key) }, "✘"),
  ]);
}
