import h3 from "../h3.js";

export default function EmptyTodoError(data, actions) {
  const { clearError } = actions;
  const { displayEmptyTodoError } = data;
  const emptyTodoErrorClass = displayEmptyTodoError ? "" : ".hidden";
  return h3(`div.error${emptyTodoErrorClass}`, [
    h3("span.error-message", ["Please enter a non-empty todo item."]),
    h3(
      "span.dismiss-error",
      {
        onclick: clearError,
      },
      "✘"
    ),
  ]);
}
