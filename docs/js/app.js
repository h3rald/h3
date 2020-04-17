import h3 from "./h3.js";

const MainView = () => {
  return h3("div.page", [
    h3("header.row", [h3("a.logo", "H3")]),
    h3("div.row", [
      h3("main.col-sm-12", [
        h3("div.card.fluid", [
          h3("div.section.double-padded", [
            h3("p", "This is the home page of the H3 microframework."),
            h3("p", [
              "Yes, there isn't much going on here right now so please head over to ",
              h3(
                "a",
                { href: "https://github.com/h3rald/h3", target: "_blank" },
                ["this repository"]
              ),
              " (you won't find any documentation there, but at least you can peek at ",
              h3(
                "a",
                {
                  href: "https://github.com/h3rald/h3/blob/master/h3.js",
                  target: "_blank",
                },
                ["the code"]
              ),
              ,
              "!).",
            ]),
          ]),
        ]),
      ]),
      h3("footer", [h3("div", "© 2020 Fabio Cevasco")]),
    ]),
  ]);
};

h3.init({
  element: document.getElementById("app"),
  modules: [],
  preStart: () => {},
  routes: {
    "/": MainView,
  },
});
