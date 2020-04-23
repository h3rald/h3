import h3 from "../h3.js";
import Paginator from "./Paginator.js";

export default function NavigationBar() {
  // Set the todo filter.
  const setFilter = (e) => {
    h3.dispatch("todos/filter", e.target.value);
    h3.redraw();
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
      oninput: setFilter,
    }),
    Paginator,
  ]);
}
