## API

The core of the H3 API is comprised of the following six methods and two properties.

### h(selector: string, attributes: object, children: array)

The `h` function is a constructor for Virtual DOM Nodes (VNodes). It can actually take from one to any number of arguments used to configure the resulting node.

The best way to understand how it works is by providing a few different examples. Please note that in each example the corresponding _HTML_ markup is provided, although such markup will actually be generated when the Virtual Node is rendered/redrawn.

#### Create an element, with an ID, classes, attributes and children

This is a complete example showing how to create a link with an `href` attribute, an ID, two classes, and three child nodes.

```js
h(
  "a#test-link.btn.primary",
  {
    href: "#/test",
  },
  ["This is a ", h("em", "test"), "link."]
);
```

↓

```html
<a id="test-link" class="btn primary" href="#/test">
  This is a <em>test</em> link.
</a>
```

#### Create an empty element

```js
h("div");
```

↓

```html
<div></div>
```

#### Create an element with a textual child node

```js
h("span", "This is a test");
```

↓

```html
<span>This is a test</span>
```

#### Create an element with child nodes

```js
h("ol", [
  h("li", "Do this first."),
  h("li", "Then this."),
  h("li", "And finally this."),
]);
```

_or_

```js
h(
  "ol",
  h("li", "Do this first."),
  h("li", "Then this."),
  h("li", "And finally this.")
);
```

↓

```html
<ol>
  <li>Do this first.</li>
  <li>Then this.</li>
  <li>And finally this.</li>
</ol>
```

#### Render a component

```js
const TestComponent = () => {
  return h(
    "button.test",
    {
      onclick: () => alert("Hello!"),
    },
    "Show Alert"
  );
};
h(TestComponent);
```

↓

```html
<button class="test">Show Alert</button>
```

Note: The event listener will not be added to the markup.

#### Render child components

```js
const TestLi = (text) => h("li.test", text);
h("ul", ["A", "B", "C"].map(TestLi));
```

↓

```html
<ul>
  <li class="test">A</li>
  <li class="test">B</li>
  <li class="test">C</li>
</ul>
```

#### Special attributes

- Any attribute starting with _on_ (e.g. onclick, onkeydown, etc.) will be treated as an event listener.
- The `classList` attribute can be set to a list of classes to apply to the element (as an alternative to using the element selector shorthand).
- The `data` attribute can be set to a simple object containing [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes).
- The special `$html` attribute can be used to set the `innerHTML` property of the resulting HTML element. Use only if you know what you are doing!
- The special `$onrender` attribute can be set to a function that will executed every time the VNode is rendered and added to the DOM.

The `$html` and the `$onrender` special attributes should be used sparingly, and typically only when interfacing with third-party libraries that need access to the real DOM.

For example, consider the following code snippet that can be used to initialize the [InscrybMDE](https://github.com/Inscryb/inscryb-markdown-editor) Markdown editor on a textarea element:

```js
h("textarea", {
  $onrender: (element) => {
    const editor = new window.InscrybMDE({
      element,
    });
  },
});
```

### h3.screen({setup, display, teardown})

Creates a Screen by providing a (mandatory) **display** function used to render content, an an optional **setup** and **teardown** functions, executed before and after the display function respectively.

Each of these functions takes a single **screen** parameter, which is initialized as an empty object before the setup, and is (optionally) returned by the teardown function should state be preserved across different screens.

Consider the following example:

```js
h3.screen({
  setup: await (state) => {
    state.data = state.data || {};
    state.id = h3.route.parts.id || 1;
    const url = `http://dummy.restapiexample.com/api/v1/employee/${id}`;
    state.data[id] = state.data[id] || await (await fetch(url)).json();
  },
  display(state) => {
    const employee = state.data[state.id];
    if (!employee) {
      return h("div.error", "Invalid Employee ID.");
    }
    return h("div.employee",
      h("h2", "Employee Profile"),
      h("dl", [
        h("dt", "Name:"),
        h("dd", data.employee_name),
        h("dt", "Salary:"),
        h("dd", `${data.employee_salary} €`),
        h("dt", "Age:"),
        h("dd", data.employee_age),
      ])
    )
  },
  teardown: (state) => ({ data: state.data })
})
```

This example shows how to implement a simple component that renders an employee profile in the `display` function, fetches data (if necessary) in the `setup` function, and preserves data in the `teardown` function.

### h3.dispatch(event: string, data: any)

Dispatches a event and optionally some data. Messages are typically handled centrally by modules.

```js
h3.dispatch("settings/set", { logging: true });
```

A event name can be any string, but keep in mind that the following names (and typically any name starting with `$`) are reserved for framework use:

- `$init` &mdash; Dispatched when the application is initialized. Useful to initialize application state.
- `$redraw` &mdash; Dispatched after an application redraw is triggered.
- `$navigation` &mdash; Dispatched after a navigation occurs.
- `$log` &mdash; Dispatched after _any_ event (except `$log` iself) is dispatched. Very useful for debugging.

### h3.init(config: object)

The initialization method of every H3 application. You _must_ call this method once to initialize your application by providing a component to render or configuration object with the following properties:

- **element** (Element) &mdash; The DOM Element to which the Application will be attached (default: `document.body`).
- **modules** (Array) &mdash; An array of functions used to handle the application state that will be executed once before starting the application.
- **routes** (Object) &mdash; An object containing routing definitions, using paths as keys and components as values. Routing paths can contain named parts like `:name` or `:id` which will populate the `parts` property of the current route (`h3.route`).
- **preStart** (Function) &mdash; An optional function to be executed before the application is first rendered.
- **postStart** (Function) &mdash; An optional function to be executed after the application is first rendered.

This is an example of a simple routing configuration:

```js
const routes = {
  "/posts/:id": Post,
  "/pages/:id": Page,
  "/": HomePage,
};
```

For more a complete example of initialization, see [this](https://h3.js.org/example/assets/js/app.js).

### h3.navigateTo(path: string, params: object)

Navigates to the specified path. Optionally, it is possibile to specify query string parameters as an object.

The following call causes the application to switch to the following URL: `#/posts/?orderBy=date&direction=desc`.

```js
h3.navigateTo("/posts/", { orderBy: "date", direction: "desc" });
```

### h3.on(event: string, handler: function)

Subscribes to the specified event and executes the specified handler function whenever the event is dispatched. Returns a function that can be used to delete the subscription.

Subscriptions should be typically managed in modules rather than in components: a component gets rendered several times and subscriptions _must_ be properly cleaned up to avoid memory leaks.

Example:

```js
const pages = (store) => {
  store.on("$init", () => ({ pagesize: 10, page: 1 }));
  store.on("pages/set", (state, page) => ({ page }));
};
```

### h3.redraw()

Triggers an application redraw. Unlike most frameworks, in H3 redraws _must_ be triggered explicitly. Just call this method whenever you want something to change and components to re-render.

### h3.route

An read-only property containing current route (Route object). A Route object has the following properties:

- **path** &mdash; The current path (fragment without #) without query string parameters, e.g. `/posts/134`
- **def** &mdash; The matching route definition, e.g. `/posts/:id`
- **query** &mdash; The query string, if present, e.g. `?comments=yes`
- **part** &mdash; An object containing the values of the parts defined in the route, e.g. `{id: "134"}`
- **params** &mdash; An object containing the query string parameters, e.g. `{comments: "yet"}`

### h3.state

A read-only property containing the current application state. The state is a plain object, but its properties should only be modified using event subscription handlers.
