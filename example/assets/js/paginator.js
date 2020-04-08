export default function Paginator() {
  return (data) => {
    const self = this;
    self.app = data.app;
    let page = data.page;
    const size = data.size;
    const total = data.total;
    const pages = Math.ceil(total / size) || 1;
    const previousClass = page > 1 ? ".link" : ".disabled";
    const nextClass = page < pages ? ".link" : ".disabled";
    function setPreviousPage() {
      page = page - 1;
      window.location.hash = `/?page=${page}`;
      self.app.redraw();
    }
    function setNextPage() {
      page = page + 1;
      window.location.hash = `/?page=${page}`;
      self.app.redraw();
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
