import h3 from "./h3.js";
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
  return h3("div.page", [
    Header,
    h3("div.row", [
      h3("input#drawer-control.drawer", { type: "checkbox" }),
      Navigation(id, ids),
      Content(pages[id]),
      Footer,
    ]),
  ]);
};

const Header = () => {
  return h3("header.row.sticky", [
    h3("a.logo.col-sm-1", { href: "#/" }, [
      h3("img", { alt: "H3", src: "images/h3.svg" }),
    ]),
    h3("div.version.col-sm.col-md", [
      h3("div.version-number", "v0.4.0"),
      h3("div.version-label", "“Dedicated Denobulan“"),
    ]),
    h3("label.drawer-toggle.button.col-sm-last", { for: "drawer-control" }),
  ]);
};

const Footer = () => {
  return h3("footer", [h3("div", "© 2020 Fabio Cevasco")]);
};

const Navigation = (id, ids) => {
  const menu = ids.map((p) =>
    h3(`a${p === id ? ".active" : ""}`, { href: `#/${p}` }, labels[p])
  );
  return h3("nav#navigation.col-md-3", [
    h3("label.drawer-close", { for: "drawer-control" }),
    ...menu,
  ]);
};

const Content = (html) => {
  const content = html
    ? h3("div.content", { $html: html })
    : h3("div.spinner-container", h3("span.spinner"));
  return h3("main.col-sm-12.col-md-9", [
    h3("div.card.fluid", h3("div.section", content)),
  ]);
};

h3.init(Page);
h3.on("$redraw", () => Prism.highlightAll());
