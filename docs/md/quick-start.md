## Quick Start

Getting up and running with H3 is simple enough, and you don't even need any special tool to build or transpile your application (unless you really, *really* require IE11 support).

### Create a basic HTML file

Start with a minimal HTML file like this one, and include an `app.js` script. That will be the entry point of your application:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>My H3-powered App</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script type="module" src="js/app.js"></script>
  </body>
</html>
```

Note that the script must be marked as an ES6 module (`type="module"`), otherwise your imports won't work.

### Import h3.js

Then, inside your `app.js` file, import `h3.js`, which should be accessible somewhere in your app:

```js
import h3 from "./h3.js";
```

This will work in [every modern browser except Internet Explorer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). You don't need a transpiler, you don't need something to convert your beautiful ES6 code back to cluncky ES5.

Unless your company tells you to, do yourself a favor and don't support IE. It's 2020, even [Microsoft moved on](https://www.theverge.com/2020/1/15/21066767/microsoft-edge-chromium-new-browser-windows-mac-download-os), and now ES6 modules work in all major browsers.

### Create your SPA

After importing the `h3` object, you can start developing your SPA. A bare minimum SPA is comprised by a single component passed to the `h3.init()` method:

```js
// A simple component printing the current date and time
// Pressig the Refresh button causes the applicationn to redraw
// And updates the displayed date/dime.
const Page = () => {
  return h3("main", [
    h3("h1", "Welcome!"),
    h3("p", `The current date and time is ${new Date()}`),
    h3("button", {
      onclick: () => h3.redraw()
    }, "Refresh")
  ]);
}
// Initialize your SPA
h3.init(Page);
```