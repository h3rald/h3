import h3 from "../h3.js";
import Paginator from "./paginator.js";
import store from "../store.js";

export default function NavigationBar() {
  // Set the todo filter.
  const setFilter = () => {
    let f = document.getElementById("filter-text");
    store.dispatch("todos/filter", f.value);
    store.dispatch("mainArea/update");
    f = document.getElementById("filter-text");
    f.focus();
  };
  // Filtering function for todo items
  return h3("div.navigation-bar", [
    h3("input", {
      id: "filter-text",
      placeholder: "Type to filter todo items...",
      onkeyup: setFilter,
    }),
    Paginator(),
  ]);
}
