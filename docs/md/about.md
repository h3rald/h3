## About

Or: _everything you wanted to know about H3, but you were afraid to ask_.

### Why the name?

Well, because I typically use [H3RALD](https://h3rald.com) as my handle online... **h** was already used by [HyperScript](https://github.com/hyperhype/hyperscript) so... **h3** was the next best thing to use as a constructor for Virtual DOM Nodes.

### A brief history of H3

A while ago, I was interviewing with several companies trying to find a new job in the JavaScript ecosystem. One of these companies asked me, as a part of their interview process, to create a simple Todo List app in JavaScript *without using any libraries*.

I spent some time thinking about it, started cobbling together a few lines of code doing the usual DOM manipulation stuff (how hard can it be, right? It's a Todo List!) and then stopped. 

_No way!_ &mdash; I thought.

There has to be a better way. If only I could use something small like [Mithril](https://mithril.js.org), it would take me no time! But sadly I couldn't. Unless...

Unless I coded the whole framework myself of course. And so I did, and that's more or less how H3 was born. You can see a slightly-modified version of the resultig Todo List app [here](https://h3.js.org/example/index.html) (with all the bonus points implemented, like localStorage support, pagination, filtering, etc.).

The original version only had an even smaller (and even buggier) Virtual DOM and hyperscript implementation, no routing and no store, but it did the job. After a few additional interviews I was actually offered the job, however I didn't take it, but that's another story ;)

A few months after that interview, I decided to take a look at that code, tidy it up, add a few bits and bobs, package it up and release it as a *proper* microframwork. Well, kind of.

### Credits

This site is built with H3 itself, in under [70 lines](https://github.com/h3rald/h3/blob/master/docs/js/app.js) of code, plus the following third-party libraries:

* [marked.js](https://marked.js.org/#/README.md#README.md)
* [Prism.js](https://prismjs.com/)
* [mini.css](https://minicss.org/)