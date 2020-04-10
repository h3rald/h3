import h3 from "../h3.js";

export default function Paginator(data, actions) {
  const { refresh } = actions;
  let page = data.page;
  const size = data.size;
  const total = data.total;
  const pages = Math.ceil(total / size) || 1;
  const previousClass = page > 1 ? ".link" : ".disabled";
  const nextClass = page < pages ? ".link" : ".disabled";
  function setPreviousPage() {
    page = page - 1;
    window.location.hash = `/?page=${page}`;
    refresh();
  }
  function setNextPage() {
    page = page + 1;
    window.location.hash = `/?page=${page}`;
    refresh();
  }
  return h3("div.paginator", [
    h3(
      `span.previous-page${previousClass}`,
      {
        onclick: setPreviousPage,
      },
      ["←"]
    ),
    h3("span.current-page", [`${String(page)}/${String(pages)}`]),
    h3(
      `span.next-page${nextClass}`,
      {
        onclick: setNextPage,
      },
      ["→"]
    ),
  ]);
}
