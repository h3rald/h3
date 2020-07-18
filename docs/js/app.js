import { h3, h } from "./h3.js";
import marked from "./vendor/marked.js";
import Prism from "./vendor/prism.js";

const labels = {
  overview: "Overview",
  "quick-start": "Quick Start",
  "key-concepts": "Key Concepts",
  tutorial: "Tutorial",
  api: "API",
  about: "About",
};

const pages = {};

const fetchPage = async (pages, id, md) => {
  if (!pages[id]) {
    const response = await fetch(md);
    const text = await response.text();
    pages[id] = marked(text);
    h3.redraw();
  }
};

const Page = () => {
  const id = h3.route.path.slice(1);
  const ids = Object.keys(labels);
  const md = ids.includes(id) ? `md/${id}.md` : `md/overview.md`;
  fetchPage(pages, id, md);
  return h("div.page", [
    Header,
    h("div.row", [
      h("input#drawer-control.drawer", { type: "checkbox" }),
      Navigation(id, ids),
      Content(pages[id]),
      Footer,
    ]),
  ]);
};

const Header = () => {
  return h("header.row.sticky", [
    h("a.logo.col-sm-1", { href: "#/" }, [
      h("img", { alt: "H3", src: "images/h3.svg" }),
    ]),
    h("div.version.col-sm.col-md", [
      h("div.version-number", "v0.10.0"),
      h("div.version-label", "“Jittery Jem'Hadar“"),
    ]),
    h("label.drawer-toggle.button.col-sm-last", { for: "drawer-control" }),
  ]);
};

const Footer = () => {
  return h("footer", [h("div", "© 2020 Fabio Cevasco")]);
};

const Navigation = (id, ids) => {
  const menu = ids.map((p) =>
    h(`a${p === id ? ".active" : ""}`, { href: `#/${p}` }, labels[p])
  );
  return h("nav#navigation.col-md-3", [
    h("label.drawer-close", { for: "drawer-control" }),
    ...menu,
  ]);
};

const Content = (html) => {
  const content = html
    ? h("div.content", { $html: html })
    : h("div.spinner-container", h("span.spinner"));
  return h("main.col-sm-12.col-md-9", [
    h("div.card.fluid", h("div.section", content)),
  ]);
};

h3.init(Page);
h3.on("$redraw", () => Prism.highlightAll());
