import h3 from "../h3.js";

export default function EmptyTodoError(data, actions) {
  const emptyTodoErrorClass = h3.state.displayEmptyTodoError ? "" : ".hidden";
  const clearError = () => {
    h3.dispatch('error/clear');
    h3.dispatch('$update');
  }
  return h3(`div#empty-todo-error.error${emptyTodoErrorClass}`, [
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
