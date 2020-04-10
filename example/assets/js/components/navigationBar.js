import h3 from "../h3.js";
import Paginator from "./paginator.js";

export default function NavigationBar(data, actions) {
  const { filter, paginatorData } = data;
  const { setFilter, update } = actions;
  return h3("div.navigation-bar", [
    h3("input", {
      id: "filter-text",
      placeholder: "Type to filter todo items...",
      onkeyup: setFilter,
      value: filter,
    }),
    Paginator(paginatorData, { update }),
  ]);
}
