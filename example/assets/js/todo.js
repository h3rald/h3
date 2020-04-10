import h3 from "./h3.js";

export default function Todo(actions) {
  const { toggle, remove } = actions;
  return function (data) {
    const todoStateClass = data.done ? ".done" : ".todo";
    return h3("div.todo-item", { id: data.key }, [
      h3(`div.todo-content${todoStateClass}`, [
        h3("span.todo-text", { onclick: () => toggle(data) }, [data.text]),
      ]),
      h3("span.delete-todo", { onclick: () => remove(data) }, ["✘"]),
    ]);
  };
}
