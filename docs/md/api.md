## API

The core of the H3 API is comprised of the following six methods and two properties.


### h3(selector: string, attributes: object, children: array)

The `h3` object is also used as a constructor for Virtual DOM Nodes (VNodes). It can actually take from one to three arguments used to configure the resulting node.

The best way to understand how it works is by providing a few different examples. Please note that in each example the corresponding *HTML* markup is provided, although such markup will actually be generated when the Virtual Node is rendered/redrawn.

#### Create an element, with an ID, classes, attributes and children

This is a complete example showing how to create a link with an `href` attribute, an ID, two classes, and three child nodes.

```js
h3("a#test-link.btn.primary", {
  href: "#/test"
}, ["This is a ", h3("em", "test"), "link."]);
```

↓

```html
<a id="test-link" class="btn primary" href="#/test">
  This is a <em>test</em> link.
</a>
```

#### Create an empty element

```js
h3("div");
```

↓

```html
<div></div>
```

#### Create an element with a textual child node

```js
h3("span", "This is a test");
```

↓

```html
<span>This is a test</span>
```

#### Create an element with child nodes

```js
h3("ol", [
  h3("li", "Do this first."),
  h3("li", "Then this."),
  h3("li", "And finally this.")
]);
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
  return h3("button.test", {
      onclick: () => alert("Hello!")
    }, "Show Alert");
};
h3(TestComponent);
```

↓

```html
<button class="test">Show Alert</button>
```

Note: The event listener will not be added to the markup.

#### Render child components

```js
const TestLi = (text) => h3("li.test", text);
h3("ul", ["A", "B", "C"].map(TestLi));
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

* Any attribute starting with *on* (e.g. onclick, onkeydown, etc.) will be treated as an event listener.
* The `classList` attribute can be set to a list of classes to apply to the element (as an alternative to using the element selector shorthand).
* The `data` attribute can be set to a simple object containing [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes).
* The special `$key` attribute can be used to guarantee the uniqueness of two VNodes and it will not be translated into an HTML attribute.
* The special `$html` attribute can be used to set the `innerHTML` property of the resulting HTML element. Use only if you know what you are doing!
* The special `$onrender` attribute can be set to a function that will executed after the VNode is rendered for the first time. 

The `$html` and the `$onrender` special attributes should be used sparingly, and typically only when interfacing with third-party libraries that need access to the real DOM. 

For example, consider the following code snippet that can be used to initialize the [InscrybMDE](https://github.com/Inscryb/inscryb-markdown-editor) Markdown editor on a textarea element:

```js
h3("textarea", {
  $onrender: (element) => {
    const editor = new window.InscrybMDE({
      element
    });
  }
});
```

### h3.dispatch(event: string, data: any)

Dispatches a event and optionally some data. Messages are typically handled centrally by modules.

```js
h3.dispatch("settings/set", { logging: true });
```

A event name can be any string, but keep in mind that the following names (and typically any name starting with `$`) are reserved for framework use:

* `$init` &mdash; Dispatched when the application is initialized. Useful to initialize application state.
* `$redraw` &mdash; Dispatched after an application redraw is triggered.
* `$navigation` &mdash; Dispatched after a navigation occurs.
* `$log` &mdash; Dispatched after *any* event (except `$log` iself) is dispatched. Very useful for debugging.

### h3.init(config: object)

The initialization method of every H3 application. You _must_ call this method once to initialize your application by providing a component to render or configuration object with the following properties:

* **element** (Element) &mdash; The DOM Element to which the Application will be attached (default: `document.body`). 
* **modules** (Array) &mdash; An array of functions used to handle the application state that will be executed once before starting the application.
* **routes** (Object) &mdash; An object containing routing definitions, using paths as keys and components as values. Routing paths can contain named parts like `:name` or `:id` which will populate the `parts` property of the current route (`h3.route`).
* **preStart** (Function) &mdash; An optional function to be executed before the application is first rendered.
* **postStart** (Function) &mdash; An optional function to be executed after the application is first rendered.

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
h3.navigateTo("/posts/", {orderBy: 'date', direction: 'desc'});
```

### h3.on(event: string, handler: function)

Subscribes to the specified event and executes the specified handler function whenever the event is dispatched. Returns a function that can be used to delete the subscription.

Subscriptions should be typically managed in modules rather than in components: a component gets rendered several times and subscriptions *must* be properly cleaned up to avoid memory leaks.

Example:

```js
const pages = (store) => {
  store.on("$init", () => ({ pagesize: 10, page: 1 }));
  store.on("pages/set", (state, page) => ({ page }));
};
```

### h3.redraw()

Triggers an application redraw. Unlike most frameworks, in H3 redraws *must* be triggered explicitly. Just call this method whenever you want something to change and components to re-render.

### h3.route

An read-only property containing current route (Route object). A Route object has the following properties:

* **path** &mdash; The current path (fragment without #) without query string parameters, e.g. `/posts/134`
* **def** &mdash; The matching route definition, e.g. `/posts/:id`
* **query** &mdash; The query string, if present, e.g. `?comments=yes`
* **part** &mdash; An object containing the values of the parts defined in the route, e.g. `{id: "134"}`
* **params** &mdash; An object containing the query string parameters, e.g. `{comments: "yet"}`

### h3.state

A read-only property containing the current application state. The state is a plain object, but its properties should only be modified using event subscription handlers. 