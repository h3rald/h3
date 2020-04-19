import h3 from "../h3.js";
import Paginator from "./Paginator.js";

export default function NavigationBar() {
  // Set the todo filter.
  const setFilter = () => {
    let f = document.getElementById("filter-text");
    h3.dispatch("todos/filter", f.value);
    h3.redraw()
    f = document.getElementById("filter-text");
    f.focus();
  };
  // Filtering function for todo items
  return h3("div.navigation-bar", [
    h3(
      "a.nav-link",
      {
        title: "Settings",
        onclick: () => h3.navigateTo("/settings"),
      },
      "⚙"
    ),
    h3("input", {
      id: "filter-text",
      placeholder: "Type to filter todo items...",
      onkeyup: setFilter,
    }),
    Paginator,
  ]);
}