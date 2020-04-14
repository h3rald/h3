import h3 from "../h3.js";

export default function AddTodoForm() {
  const addTodo = () => {
    const newTodo = document.getElementById("new-todo");
    if (!newTodo.value) {
      h3.dispatch("error/set");
      h3.redraw()
      document.getElementById("new-todo").focus();
      return;
    }
    h3.dispatch("error/clear");
    h3.dispatch("todos/add", {
      key: `todo_${Date.now()}__${newTodo.value}`, // Make todos "unique-enough" to ensure they are processed correctly
      text: newTodo.value,
    });
    newTodo.value = "";
    h3.redraw()
    document.getElementById("new-todo").focus();
  };
  const addTodoOnEnter = (event) => {
    if (event.keyCode == 13) {
      addTodo();
      event.preventDefault();
    }
  };
  return h3("form.add-todo-form", [
    h3("input", {
      id: "new-todo",
      placeholder: "What do you want to do?",
      onkeydown: addTodoOnEnter,
    }),
    h3(
      "span.submit-todo",
      {
        title: "Add Todo",
        onclick: addTodo,
      },
      "+"
    ),
  ]);
}
