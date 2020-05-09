## Key Concepts

There are just a few things you should know about if you want to use H3. 

Oh... and a solid understanding of HTML and JavaScript wouldn't hurt either ;)

### HyperScript

H3 uses a [HyperScript](https://openbase.io/js/hyperscript)-like syntax to create HTML elements in pure JavaScript. No, you are actually creating Virtual DOM nodes with it but it can be easier to think about them as HTML elements, or better, something that *eventually* will be rendered as an HTML element.

The main difference between H3's HyperScript implementation and others is that it uses **h3** as the main constructor to create nodes. HyperScript uses **h**, Mithril uses **m**, ...kind of an obvious choice if you ask me. If you don't like it, you can rename it to *piripicchio* if you want, and it will *still* be used in the same way.

How, you ask? Like this:

```js
h3("div.test", [
  h3("ul", [
    h3("li", "This is..."),
    h3("li", "...a simple..."),
    h3("li", "unordered list.")
  ])
]);
```

...which will output:

```html
<div class="test">
  <ul>
    <li>This is...</li>
    <li>...a simple...</li>
    <li>...unordered list.</li>
  </ul>
</div>
```

Simple enough. Yes there are some quirks to it, but check the API or Usage docs for those.

### Components

In H3, a component is a function that returns a Virtual Node or a string (that will be treated as a textual DOM node). 

Yes that's it. An example? here:

```js
let count = 0;
const CounterButton = () => {
  return h3("button", {
    onclick: () => count +=1 && h3.redraw()
  }, `You clicked me ${count} times.`);
}
```

### Store

H3 essentially uses something very, *very* similar to [Storeon](https://github.com/storeon/storeon) for state management *and* also as a very simple client-side event dispatcher/subscriber (seriously, it is virtually the same code as Storeon). Typically you'll only use the default store created by H3 upon initialization, and you'll use the `h3.dispatch()` and `h3.on()` methods to dispatch and subscribe to events.

The current application state is accessible via the `h3.state` property.

### Modules

The `h3.init()` method takes an array of *modules* that can be used to manipulate the application state when specific events are received. A simple module looks like this:

```js
const error = () => {
  h3.on("$init", () => ({ displayEmptyTodoError: false }));
  h3.on("error/clear", (state) => ({ displayEmptyTodoError: false }));
  h3.on("error/set", (state) => ({ displayEmptyTodoError: true }));
};
```

Essentially a module is just a function that typically is meant to run only once to define one or more event subscriptions. Modules are the place where you should handle state changes in your application.

### Router

H3 comes with a very minimal but fully functional URL fragment router. You create your application routes when initializing your application, and you can navigate to them using ordinary `href` links or programmatically using the `h3.navigateTo` method.

The current route is always accessible via the `h3.route` property.

### How everything works...

The following sequence diagram summarizes how H3 works, from its initialization to the redraw and navigation phases.

![Sequence Diagram](images/h3.sequence.svg)

When the `h3.init()` method is called at application level, the following operations are performed in sequence:

1. The *Store* is created and initialized.
2. Any *Module* specified when calling `h3.init()` is executed.
3. The **$init** event is dispatched.
4. The *preStart* function (if specified when calling `h3.init()`) is executed.
5. The *Router* is initialized and started.
6. The **$navigation** event is dispatched.
7. All *Components* matching the current route are rendered for the first time.
8. The **$redraw** event is dispatched.

Then, whenever the `h3.redraw()` method is called (typically within a component):

1. The whole application is redrawn, i.e. every *Component* currently rendered on the page is redrawn.
2. The **$redraw** event is dispatched.

Similarly, whenever the `h3.navigateTo()` method is called (typically within a component), or the URL fragment changes:

1. The *Router* processes the new path and determine which component to render based on the routing configuration.
2. All DOM nodes within the scope of the routing are removed, all components are removed.
3. The **$navigation** event is dispatched.
4. The *Component* matching the new route is rendered.
5. The **$redraw** event is dispatched.

And that's it. The whole idea is to make the system extremely *simple* and *predictable* &mdash; which means everything should be very easy to debug, too.
