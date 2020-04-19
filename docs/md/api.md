## API

The core of the H3 API is comprised of the following six methods and two properties.

### h3.equal(a: any, b: any)

A way to determine if two object or literals are equal. This method is mainly used internally by the Virtual DOM diffing algorithm.

Note that two functions are considered _equal_ if their source code is exactly the same. This may not be ideal in certain situations, but when it comes to diffing two nodes that may be generated dynamically through iteration it generally makes sense to behave in this way.

### h3.dispatch(message: string, data: any)

Dispatches a message and optionally some data. Messages are typically handled centrally by modules.

```js
h3.dispatch("settings/set", { logging: true });
```

A message name can be anything, but keep in mind that the following names (and typically any name starting with `$`) are reserved for framework use:

* `$init` &mdash; Dispatched when the application is initialized. Useful to initialize application state.
* `$redraw` &mdash; Dispatched after an application redraw is triggered.
* `$navigation` &mdash; Dispatched after a navigation occurs.
* `$log` &mdash; Dispatched after *any* message (except `$log` iself) is dispatched. Very useful for debugging.

### h3.init(config: object))

The initialization method of every H3 application. You _must_ call this method once to initialize your application by providing a component to render or configuration object with the following properties:

<table>
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td data-label="Property">element</td>
    <td data-label="Type">Element</td>
    <td data-label="Description">The DOM Element to which the Application will be attached (default: document.body).</td>
  </tr>
  <tr>
    <td data-label="Property">routes</td>
    <td data-label="Type">Object</td>
    <td data-label="Description">An object containing paths as key and components as values, corresponding to the routes of the application.</td>
  </tr>
  <tr>
    <td data-label="Property">modules</td>
    <td data-label="Type">Array</td>
    <td data-label="Description">An array of functions used to handle the application state.</td>
  </tr>
  <tr>
    <td data-label="Property">preStart</td>
    <td data-label="Type">Function</td>
    <td data-label="Description">An optional function to be executed before the application is first rendered.</td>
  </tr>
  <tr>
    <td data-label="Property">postStart</td>
    <td data-label="Type">Function</td>
    <td data-label="Description">An optional function to be executed after the application is first rendered.</td>
  </tr>
  </tbody>
</table>

Routing paths can contain named parts like `:name` or `:id` which will populate the `parts` property of the current route.

This is an example of a possible routing configuration:

```js
const routes = {
  "/posts/:id": Post,
  "/pages/:id": Page,
  "/": HomePage,
};
```

### h3.navigateTo(path: string, params: object)

Navigates to the specified path. Optionally, it is possibile to specify query string parameters as an object.

The following call causes the application to switch to the following URL: `#/posts/?orderBy=date&direction=desc`.

```js
h3.navigateTo("/posts/", {orderBy: 'date', direction: 'desc'});
```

### h3.on(message: string, handler: function)

Subscribes to the specified message and executes the specified handler function whenever the message is dispatches. Returns a function that can be used to delete the subscription.

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

An object containing the current route. A Route object has the following properties:

* `path` &mdash; The current path (fragment without #) without query string parameters, e.g. `/posts/134`
* `def` &mdash; The matching route definition, e.g. `/posts/:id`
* `query` &mdash; The query string, if present, e.g. `?comments=yes`
* `parts` &mdash; An object containing the values of the parts defined in the route, e.g. `{id: "134"}`
* `params` &mdash; An object containing the query string parameters, e.g. `{comments: "yet"}`

### h3.state

An object containing the current application state. Do not modify this directly, use subscriptions in modules to modify it.