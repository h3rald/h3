## Overview

**H3** is a microframework to build client-side web applications in modern JavaScript.

H3 is also:

* **tiny**, under [700 sloc](https://github.com/h3rald/h3/blob/master/h3.js).
* **bare-bones**, it contains just the bare minimum to create a fully-functional single-pace application.
* **modern**, it runs only in modern browsers (latest versions of Chrome, Firefox, Edge & similar).
* **easy** to learn, its API is comprised of only 6 methods and 2 properties.


### Hello, World!

Here's an example of an extremely minimal SPA created with H3:

```js
import h3 from "./h3.js";
h3.init(() => h3("h1", "Hello, World!"));
```

This will render a `h1` tag within the document body, containing the text `"Hello, World!"`.