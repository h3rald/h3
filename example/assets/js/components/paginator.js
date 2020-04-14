import h3 from "../h3.js";

export default function Paginator() {
  const hash = window.location.hash;
  let { page, pagesize, filteredTodos } = h3.state();
  let total = filteredTodos.length;
  if (h3.route().params.page) {
    page = parseInt(h3.route().params.page);
  }
  // Recalculate page in case data is filtered.
  page = Math.min(Math.ceil(filteredTodos.length / pagesize), page) || 1;
  h3.dispatch("pages/set", page);
  const pages = Math.ceil(total / pagesize) || 1;
  const previousClass = page > 1 ? ".link" : ".disabled";
  const nextClass = page < pages ? ".link" : ".disabled";
  const setPage = (value) => {
    const page = h3.state("page");
    const newPage = page + value;
    h3.dispatch("pages/set", newPage);
    h3.go("/", { page: newPage });
  }
  return h3("div.paginator", [
    h3(
      `span.previous-page${previousClass}`,
      {
        onclick: () => setPage(-1),
      },
      ["←"]
    ),
    h3("span.current-page", [`${String(page)}/${String(pages)}`]),
    h3(
      `span.next-page${nextClass}`,
      {
        onclick: () => setPage(+1),
      },
      ["→"]
    ),
  ]);
}
