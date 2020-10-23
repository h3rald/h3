## Key Concepts

There are just a few things you should know about if you want to use H3. 

Oh... and a solid understanding of HTML and JavaScript wouldn't hurt either ;)

### HyperScript

H3 uses a [HyperScript](https://openbase.io/js/hyperscript)-like syntax to create HTML elements in pure JavaScript. No, you are actually creating Virtual DOM nodes with it but it can be easier to think about them as HTML elements, or better, something that *eventually* will be rendered as an HTML element.

How, you ask? Like this:

```js
h("div.test", [
  h("ul", [
    h("li", "This is..."),
    h("li", "...a simple..."),
    h("li", "unordered list.")
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

### Component

In H3, a component is a function that returns a Virtual Node or a string (that will be treated as a textual DOM node). 

Yes that's it. An example? here:

```js
let count = 0;
const CounterButton = () => {
  return h("button", {
    onclick: () => count +=1 && h3.redraw()
  }, `You clicked me ${count} times.`);
}
```

### Router

H3 comes with a very minimal but fully functional URL fragment router. You create your application routes when initializing your application, and you can navigate to them using ordinary `href` links or programmatically using the `h3.navigateTo` method.

The current route is always accessible via the `h3.route` property.


### Screen

A screen is a top-level component that handles a route. Unlike ordinary components, screens:

* may have a dedicated *setup* (after the screen is added to the DOM) and *teardown* phase (after the screen is removed from the DOM and before the new screen is loaded).
* may have built-in local state, initialized during setup and (typically) destroyed during teardown. Such state is passed as the first (and only) parameter of the screen when executed.

Screens are typically created using the **h3.screen** shorthand method, but they can stll created using an ordinary function returning a VNode, but you can optionally define a **setup** and a **teardown** async methods on them (functions are objects in JavaScript after all...) to be executed during each corresponding phase.

Note that:
* Both the **setup** method take an object as a parameter, representing the component state. Such object will be empty the first time the **setup** method is called for a given component, but it may contain properties not removed during subsequent teardowns.
* If the **setup** method returns **false**, the **display** method of the screen (or the main screen function if you created it manually) will not be executed. This can be useful in certain situations to interrupt navigation or perform redirects.
* The **teardown** method can return an object, which will be retained as component state. If however nothing is returned, the component state object is emptied.
* Both methods can be asynchronous, in which case H3 will wait for their completion before proceeding.

### Store

H3 essentially uses something very, *very* similar to [Storeon](https://github.com/storeon/storeon) for state management *and* also as a very simple client-side event dispatcher/subscriber (seriously, it is virtually the same code as Storeon). Typically you'll only use the default store created by H3 upon initialization, and you'll use the `h3.dispatch()` and `h3.on()` methods to dispatch and subscribe to events.

The current application state is accessible via the `h3.state` property.

### Module

The `h3.init()` method takes an array of *modules* that can be used to manipulate the application state when specific events are received. A simple module looks like this:

```js
const error = () => {
  h3.on("$init", () => ({ displayEmptyTodoError: false }));
  h3.on("error/clear", (state) => ({ displayEmptyTodoError: false }));
  h3.on("error/set", (state) => ({ displayEmptyTodoError: true }));
};
```

Essentially a module is just a function that typically is meant to run only once to define one or more event subscriptions. Modules are the place where you should handle state changes in your application.

### How everything works...

The following sequence diagram summarizes how H3 works, from its initialization to the redraw and navigation phases.

![Sequence Diagram](images/h3.sequence.svg)

When the `h3.init()` method is called at application level, the following operations are performed in sequence:

1. The *Store* is created and initialized.
2. Any *Module* specified when calling `h3.init()` is executed.
3. The **$init** event is dispatched.
4. The *preStart* function (if specified when calling `h3.init()`) is executed.
5. The *Router* is initialized and started.
6. The **setup()** method of the matching Screen is called (if any).
8. The **$navigation** event is dispatched.
9. The *Screen* matching the current route and all its child components are rendered for the first time.
10. The **$redraw** event is dispatched.

Then, whenever the `h3.redraw()` method is called (typically within a component):

1. The whole application is redrawn, i.e. every *Component* currently rendered on the page is redrawn.
2. The **$redraw** event is dispatched.

Similarly, whenever the `h3.navigateTo()` method is called (typically within a component), or the URL fragment changes:

1. The *Router* processes the new path and determine which component to render based on the routing configuration.
2. The **teardow()** method of the current Screen is called (if any).
3. The **setup()** method of the new matching Screen is called (if any).
4. All DOM nodes within the scope of the routing are removed, all components are removed.
6. The **$navigation** event is dispatched.
7. All DOM nodes are removed.
8. The *Screen* matching the new route and all its child components are rendered.
10. The **$redraw** event is dispatched.

And that's it. The whole idea is to make the system extremely *simple* and *predictable* &mdash; which means everything should be very easy to debug, too.
