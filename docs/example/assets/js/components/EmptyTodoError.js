import { h3, h } from "../h3.js";

export default function EmptyTodoError(data, actions) {
  const emptyTodoErrorClass = h3.state.displayEmptyTodoError ? "" : ".hidden";
  const clearError = () => {
    h3.dispatch('error/clear');
    h3.redraw();
  }
  return h(`div#empty-todo-error.error${emptyTodoErrorClass}`, [
    h("span.error-message", ["Please enter a non-empty todo item."]),
    h(
      "span.dismiss-error",
      {
        onclick: clearError,
      },
      "✘"
    ),
  ]);
}
