import h3 from "./h3.js";
import marked from "./vendor/marked.js";
import Prism from "./vendor/prism.js";

const labels = {
  overview: "Overview",
  "quick-start": "Quick Start",
  "key-concepts": "Key Concepts",
  usage: "Usage",
  api: "API",
  about: "About",
};

const pages = {};

const Page = () => {
  const id = h3.route.path.slice(1);
  const ids = Object.keys(labels);
  const md = ids.includes(id) ? `md/${id}.md` : `md/overview.md`;
  if (!pages[id]) {
    (async () => {
      const response = await fetch(md);
      const text = await response.text();
      pages[id] = marked(text);
      h3.redraw();
    })();
  }
  const menu = ids.map((p) => h3("a", { href: `#/${p}` }, labels[p]));
  let content = pages[id]
    ? h3("div.content", { $html: pages[id] })
    : h3("div.spinner-container", h3("span.spinner"));
  return h3("div.page", [
    h3("header.row.sticky", [
      h3("a.logo.col-sm", { href: "#/" }, "H3"),
      h3("label.drawer-toggle.button.col-sm-last", { for: "drawer-control" }),
    ]),
    h3("div.row", [
      h3("input#drawer-control.drawer", { type: "checkbox" }),
      h3("nav#navigation.col-md-3", [
        h3("label.drawer-close", { for: "drawer-control" }),
        ...menu,
      ]),
      h3("main.col-sm-12.col-md-9", [
        h3("div.card.fluid", h3("div.section", content)),
      ]),
      h3("footer", h3("div", "© 2020 Fabio Cevasco")),
    ]),
  ]);
};

h3.init(Page);
h3.on("$redraw", () => Prism.highlightAll());