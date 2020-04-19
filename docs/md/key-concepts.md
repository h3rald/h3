## Key Concepts

There are essentially four things you need to know about if you want to use H3. Except a solid understanding of HTML and JavaScript of course ;)

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
    onclick: () => {
      count +=1;
      h3.redraw();
    }
  }, `You clicked me ${count} times.`);
}
```

### Store

H3 essentially uses something very, *very* similar to [StoreOn](https://github.com/storeon/storeon) for state maagemennt *and* also as a very simple client-side message dispatcher/subscriber. Typically you'll only use the defaulr store created by H3 on initialization, and you'll use the `h3.dispatch()` and `h3.on()` methods to dispatch and subscribe to actions (messages).

The current application state is accessible via the `h3.state` property.

### Router

H3 comes with a very minimal but fully functional URL fragment router. You create your application routes when initializing your application, and you can navigate to them using ordinary HREF links or the `h3.navigateTo` method.

The current route is accessible via the `h3.route` property.