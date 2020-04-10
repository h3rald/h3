import h3 from "../h3.js";

export default function AddTodoForm(actions) {
  const { addTodo, addTodoOnEnter, updateError, updateMainSection } = actions;
  return h3("form.add-todo-form", [
    h3("input", {
      id: "new-todo",
      placeholder: "What do you want to do?",
      autofocus: true,
      onkeydown: (event) => addTodoOnEnter(event, updateError, updateMainSection),
    }),
    h3(
      "span.submit-todo",
      {
        onclick: () => addTodo(updateError, updateMainSection),
      },
      ["+"]
    ),
  ]);
}
