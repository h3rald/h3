import h3 from "../h3.js";

export default function Todo(data, actions) {
  const { toggleTodo, removeTodo } = actions;
  const todoStateClass = data.done ? ".done" : ".todo";
  return h3("div.todo-item", { id: data.key }, [
    h3(`div.todo-content${todoStateClass}`, [
      h3("span.todo-text", { onclick: () => toggleTodo(data) }, [data.text]),
    ]),
    h3("span.delete-todo", { onclick: () => removeTodo(data) }, ["✘"]),
  ]);
};
