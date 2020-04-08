import h3 from './h3.js';

export default function Paginator(app) {
  return function(data) {
    let page = data.page;
    const size = data.size;
    const total = data.total;
    const pages = Math.ceil(total / size) || 1;
    const previousClass = page > 1 ? ".link" : ".disabled";
    const nextClass = page < pages ? ".link" : ".disabled";
    function setPreviousPage() {
      page = page - 1;
      window.location.hash = `/?page=${page}`;
      app.redraw();
    }
    function setNextPage() {
      page = page + 1;
      window.location.hash = `/?page=${page}`;
      app.redraw();
    }
    return h3("div.paginator", [
      h3(`span.previous-page.fas.fa-arrow-left${previousClass}`, {
        onclick: setPreviousPage,
      }),
      h3("span.current-page", [`${String(page)}/${String(pages)}`]),
      h3(`span.next-page.fas.fa-arrow-right${nextClass}`, {
        onclick: setNextPage,
      }),
    ]);
  };
}
