import { h3, h } from "../h3.js";
import Paginator from "./Paginator.js";

export default function NavigationBar() {
  // Set the todo filter.
  const setFilter = (e) => {
    h3.dispatch("todos/filter", e.target.value);
    h3.redraw();
  };
  // Filtering function for todo items
  return h("div.navigation-bar", [
    h(
      "a.nav-link",
      {
        title: "Settings",
        onclick: () => h3.navigateTo("/settings"),
      },
      "⚙"
    ),
    h("input", {
      id: "filter-text",
      placeholder: "Type to filter todo items...",
      oninput: setFilter,
    }),
    Paginator,
  ]);
}
