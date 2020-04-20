## Overview

**H3** is a microframework to build client-side web applications in modern JavaScript.

H3 is also:

* **tiny**, under [700 sloc](https://github.com/h3rald/h3/blob/master/h3.js).
* **bare-bones**, it contains just the bare minimum to create a fully-functional single-page application.
* **modern**, in the sense that it runs only in modern browsers (latest versions of Chrome, Firefox, Edge & similar).
* **easy** to learn, its API is comprised of only seven methods and two properties.

### I'm sold! Where can I get it?

It ain't formally released yet, sorry! But, if you are brave enough, you can...

<a href="https://raw.githubusercontent.com/h3rald/h3/master/h3.js" target="_blank" class="button primary">Download the Development Version</a>

### Hello, World?

Here's an example of an extremely minimal SPA created with H3:

```js
import h3 from "./h3.js";
h3.init(() => h3("h1", "Hello, World!"));
```

This will render a `h1` tag within the document body, containing the text `"Hello, World!"`.

### Something more complex?

Have a look at the code of a [simple todo list](https://github.com/h3rald/h3/tree/master/docs/example) ([demo](https://h3.js.org/example/index.html)) with several components, a store and some routing.