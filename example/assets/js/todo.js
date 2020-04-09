import h3 from './h3.js';

export default function Todo(app) {
  return function(data) {
    const todoStateClass = data.done ? ".done" : ".todo";
    function toggle() {
      data.done = !data.done;
      app.update();
    }
    function remove() {
      app.todos = app.todos.filter(({ key }) => key !== data.key);
      app.update();
    }
    return h3("div.todo-item", { id: data.key }, [
      h3(`div.todo-content${todoStateClass}`, [
        h3("span.todo-text", { onclick: toggle }, [data.text]),
      ]),
      h3("span.delete-todo.fas.fa-trash", { onclick: remove }),
    ]);
  };
}
