import h3 from "../h3.js";
import store from "../store.js";

export default function EmptyTodoError(data, actions) {
  const emptyTodoErrorClass = store.get('displayEmptyTodoError') ? "" : ".hidden";
  const clearError = () => {
    store.dispatch('emptyTodoError.clear');
    store.dispatch('emptyTodoError.update');
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
