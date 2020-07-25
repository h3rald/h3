import { h3, h } from "../h3.js";

export default function AddTodoForm() {
  let value = "";
  const focus = () => document.getElementById("new-todo").focus();  
  const addTodo = () => {
    if (!value) {
      h3.dispatch("error/set");
      h3.redraw()
      focus();
      return;
    }
    h3.dispatch("error/clear");
    h3.dispatch("todos/add", {
      key: `todo_${Date.now()}__${btoa(value)}`, 
      text: value
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
    value,
    oninput: (e) => {
      value = e.target.value;
      newTodo.value = value;
    },
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
