import { h3, h } from "../h3.js";

export default function AddTodoForm() {
  const focus = () => document.getElementById("new-todo").focus();  
  const addTodo = () => {
    if (!newTodo.value) {
      h3.dispatch("error/set");
      h3.redraw()
      focus();
      return;
    }
    h3.dispatch("error/clear");
    h3.dispatch("todos/add", {
      key: `todo_${Date.now()}__${btoa(newTodo.value)}`, 
      text: newTodo.value
    });
    h3.redraw()
    focus();
  };
  const addTodoOnEnter = (e) => {
    if (e.keyCode == 13) {
      addTodo();
      e.preventDefault();
    }
  };
  const newTodo = h("input", {
    id: "new-todo",
    placeholder: "What do you want to do?",
    oninput: (e) => newTodo.value = e.target.value,
    onkeydown: addTodoOnEnter,
  });
  return h("form.add-todo-form", [
    newTodo,
    h(
      "span.submit-todo",
      {
        title: "Add Todo",
        onclick: addTodo,
      },
      "+"
    ),
  ]);
}
