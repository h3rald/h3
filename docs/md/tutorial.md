## Tutorial 

As a (meta) explanation of how to use H3, let's have a look at how the [H3 web site](https://h3.js.org) itself was created.

The idea was to build a simple web site to display the documentation of the H3 microframework, so it must be able to:

* Provide a simple way to navigate through page.
* Render markdown content (via [marked.js](https://marked.js.org/#/README.md#README.md))
* Apply syntax highlighting (via [Prism.js](https://prismjs.com/))

As far as look and feel is concerned, I wanted something minimal but functional, so [mini.css](https://minicss.org/) was more than enough.

The full source of the site is available [here](https://github.com/h3rald/h3/tree/master/docs).

### Create a simple HTML file

Start by creating a simple HTML file. Place a script loading the entry point of your application within the `body` and set its type to `module`. 

This will let you load an ES6 file containing imports to other files... it works in all major browsers, but it doesn't work in IE (but we don't care about that, do we?).

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>H3</title>
    <meta name="description" content="A bare-bones client-side web microframework" />
    <meta name="author" content="Fabio Cevasco" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="favicon.png" type="image/png">
    <link rel="stylesheet" href="css/mini-default.css" />
    <link rel="stylesheet" href="css/prism.css" />
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <script type="module" src="js/app.js"></script>
  </body>
</html>
```

### Create a single-page application

In this case the code for the SPA is not very complex, you can have a look at it [here](https://github.com/h3rald/h3/blob/master/docs/js/app.js).

Normally you'd have several components, at least one file containing modules to manage the application state, etc. (see the [todo list example](https://github.com/h3rald/h3/tree/master/docs/example)), but in this case a single component is sufficient.

Start by importing all the JavaScript modules you need:

```js
import h3 from "./h3.js";
import marked from "./vendor/marked.js";
import Prism from "./vendor/prism.js";
```

Easy enough. Then we want to store the mapping between the different page fragments and their titles:

```js
const labels = {
  overview: "Overview",
  "quick-start": "Quick Start",
  "key-concepts": "Key Concepts",
  tutorial: "Tutorial",
  api: "API",
  about: "About",
};
```

We are going to store the HTML contents of each page in an Object, and we're going to need a simple function to [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) the Markdown file and render it as HTML:


```js
const pages = {};

const fetchPage = async (pages, id, md) => {
  if (!pages[id]) {
    const response = await fetch(md);
    const text = await response.text();
    pages[id] = marked(text);
    h3.redraw();
  }
};
```

Basically this function is going to be called when you navigate to each page, and it:

1. fetches the content of the requested file (`md`))
2. renders the Markdown code into HTML using marked, and stores it in the `pages` object
3. Triggers a redraw of the application

We are gonna use our `fetchPage` function inside the main component of our app, `Page`:

```js
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
```

The main responsibility of this component is to fetch the Markdown content and render the whole page, but note how the rendering different portions of the page are delegated to different components: `Header`, `Navigation`, `Content`, and `Footer`.

The `Header` and `Footer` components are very simple: their only job is to render static content:

```js
const Header = () => {
  return h3("header.row.sticky", [
    h3("a.logo.col-sm-1", { href: "#/" }, [
      h3("img", { alt: "H3", src: "images/h3.svg" }),
    ]),
    h3("div.version.col-sm.col-md", [
      h3("div.version-number", "v0.5.0"),
      h3("div.version-label", "“Experienced El-Aurian“"),
    ]),
    h3("label.drawer-toggle.button.col-sm-last", { for: "drawer-control" }),
  ]);
};

const Footer = () => {
  return h3("footer", [h3("div", "© 2020 Fabio Cevasco")]);
};
```

The `Navigation` component is more interesting, as it takes two parameters:

* The ID of the current page
* The list of page IDs

...and it uses this information to create the site navigation menu dynamically:

```js
const Navigation = (id, ids) => {
  const menu = ids.map((p) =>
    h3(`a${p === id ? ".active" : ""}`, { href: `#/${p}` }, labels[p])
  );
  return h3("nav#navigation.col-md-3", [
    h3("label.drawer-close", { for: "drawer-control" }),
    ...menu,
  ]);
};
```

Finally, the `Content` component optionally takes a string containing the HTML of the page content to render. If no content is provided, it will display a loading spinner, otherwise it will render the content by using the special `$html` attribute that can be used to essentially set the `innerHTML` of an element:

```js
const Content = (html) => {
  const content = html
    ? h3("div.content", { $html: html })
    : h3("div.spinner-container", h3("span.spinner"));
  return h3("main.col-sm-12.col-md-9", [
    h3("div.card.fluid", h3("div.section", content)),
  ]);
};
```

Now, the key here is that we are only ever going to render "known" pages that are listed in the `labels` object.

Suppose for example that the `#/overview` page is loaded. The `h3.route.path` in this case is going to be set to `/overview`, which in turns corresponds to an ID of a well-known page (`overview`).

In a similar way, other well-known pages can easily be mapped to IDs, but it is also important to handle _unknown_ pages (technically I could even pass an URL to a different site containing a malicious markdown page and have it rendered!), and if a page passed in the URL fragment is not present in the `labels` Object, the Overview page will be rendered instead.

This feature is also handy to automatically load the Overview when no fragment is specified.

### Initialization and post-redraw operations

Done? Not quite. We need to initialize the SPA by passing the `Page` component to the `h3.init()` method to trigger the first rendering:

```js
h3.init(Page);
```

And that's it. Noooo wait, what about syntax highlighting? That needs to be applied _after_ the HTML markup is rendered. How can we manage that?

Easy enough, add a handler to be executed whenever the SPA is redrawn:

```js
h3.on("$redraw", () => Prism.highlightAll());
```

### Next steps

Made it this far? Good. Wanna know more? Have a look at the code of the [todo list example](https://github.com/h3rald/h3/tree/master/docs/example) and try it out [here](https://h3.js.org/example/index.html).