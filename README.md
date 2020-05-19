<a href="https://www.npmjs.com/package/@h3rald/h3" target="_blank" class="badge"><img src="https://img.shields.io/npm/v/@h3rald/h3"></a>
<a href="https://github.com/h3rald/h3/blob/master/LICENSE" target="_blank" class="badge"><img src="https://img.shields.io/github/license/h3rald/h3"></a>
<a href="https://travis-ci.org/github/h3rald/h3" target="_blank" class="badge"><img src="https://img.shields.io/travis/h3rald/h3"></a>
<a href="https://coveralls.io/github/h3rald/h3?branch=master" target="_blank" class="badge"><img src="https://img.shields.io/coveralls/github/h3rald/h3"></a>

***

## Overview

**H3** is a microframework to build client-side single-page applications (SPAs) in modern JavaScript.

H3 is also:

- **tiny**, under [700 sloc](https://github.com/h3rald/h3/blob/master/h3.js).
- **modern**, in the sense that it runs only in modern browsers (latest versions of Chrome, Firefox, Edge & similar).
- **easy** to learn, its API is comprised of only six methods and two properties.

### I'm sold! Where can I get it?

Here, look, it's just one file:

<a href="https://raw.githubusercontent.com/h3rald/h3/v0.6.0/h3.js" target="_blank" class="button primary">Download v0.6.0 (Furtive Ferengi)</a>

Yes there is also a [NPM package](https://www.npmjs.com/package/@h3rald/h3) if you want to use it with WebPack and similar, but let me repeat: _it's just one file_.

### Hello, World?

Here's an example of an extremely minimal SPA created with H3:

```js
import h3 from "./h3.js";
h3.init(() => h3("h1", "Hello, World!"));
```

This will render a `h1` tag within the document body, containing the text `"Hello, World!"`.

### Something more complex?

Have a look at the code of a [simple todo list](https://github.com/h3rald/h3/tree/master/docs/example) ([demo](https://h3.js.org/example/index.html)) with several components, a store and some routing.

### Can I use it then, no strings attached?

Yes. It's [MIT-licensed](https://github.com/h3rald/h3/blob/master/LICENSE).

### What if something is broken?

Go fix it! Or at least open an issue on the [Github repo](https://github.com/h3rald/h3), pleasy.

