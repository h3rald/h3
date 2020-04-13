import h3 from "../h3.js";
import store from "../store.js";

export default function AddTodoForm() {
  const addTodo = () => {
    const newTodo = document.getElementById("new-todo");
    if (!newTodo.value) {
      store.dispatch("error/set");
      store.dispatch("$update");
      document.getElementById("new-todo").focus();
      return;
    }
    store.dispatch("error/clear");
    store.dispatch("todos/add", {
      key: `todo_${Date.now()}__${newTodo.value}`, // Make todos "unique-enough" to ensure they are processed correctly
      text: newTodo.value,
    });
    newTodo.value = "";
    store.dispatch("$update");
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
        onclick: addTodo,
      },
      "+"
    ),
  ]);
}
