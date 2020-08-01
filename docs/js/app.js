import { h3, h } from "./h3.js";
import marked from "./vendor/marked.js";
import Prism from "./vendor/prism.js";

const labels = {
  overview: "Overview",
  "quick-start": "Quick Start",
  "key-concepts": "Key Concepts",
  "best-practices": "Best Practices",
  tutorial: "Tutorial",
  api: "API",
  about: "About",
};

const Page = h3.screen({
  setup: async (state) => {
    state.pages = state.pages || {};
    state.id = h3.route.path.slice(1);
    state.ids = Object.keys(labels);
    state.md = state.ids.includes(state.id)
      ? `md/${state.id}.md`
      : `md/overview.md`;
    await fetchPage(state);
  },
  display: (state) => {
    return h("div.page", [
      Header,
      h("div.row", [
        h("input#drawer-control.drawer", { type: "checkbox" }),
        Navigation(state.id, state.ids),
        Content(state.pages[state.id]),
        Footer,
      ]),
    ]);
  },
  teardown: (state) => state,
});

const fetchPage = async ({ pages, id, md }) => {
  if (!pages[id]) {
    const response = await fetch(md);
    const text = await response.text();
    pages[id] = marked(text);
  }
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
  const content = h("div.content", { $html: html });
  return h("main.col-sm-12.col-md-9", [
    h(
      "div.card.fluid",
      h("div.section", { $onrender: () => Prism.highlightAll() }, content)
    ),
  ]);
};

h3.init(Page);
