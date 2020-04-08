export default function Todo() {
  return function (data) {
    const self = this;
    self.app = data.app;
    self.view = (h3, data) => {
      const todoStateClass = data.done ? ".done" : ".todo";
      function toggle() {
        data.done = !data.done;
        self.app.redraw();
      }
      function remove() {
        self.app.todos = self.app.todos.filter(({ key }) => key !== data.key);
        self.app.redraw();
      }
      return h3("div.todo-item", { id: data.key }, [
        h3(`div.todo-content${todoStateClass}`, [
          h3("span.todo-text", { onclick: toggle }, [data.text]),
        ]),
        h3("span.delete-todo.fas.fa-trash", { onclick: remove }),
      ]);
    };
  };
}
