## Best Practices

This page lists some common tips and best practices to get the most out of H3. Some of these may sound counter-intuitive (especially if you are using to frameworks advocating absolute data immutability), but they work well with H3 because of the way it is designed.

### Embrace Mutability

No, that's not a mistake. Although you should understand [why immutability is important](https://stackoverflow.com/questions/34385243/why-is-immutability-so-important-or-needed-in-javascript), you shouldn't force yourself to use it in all situations. Instead, you should go through [this article](https://desalasworks.com/article/immutability-in-javascript-a-contrarian-view/) and try to understand also a contrarian view of immutability.

In H3, changes only occur when needed. Most notably, when re-rendering the Virtual DOM tree of the application will be *mutated in place*, but only where necessary. Functions as well are considered equal if their source code (i.e. string representation) is equal. While this can cause problems in some situations if you are not aware of it, it can be beneficial and actually simplify things most of the time.

When managing state, if something is different you should typically _just change it_, unless it's shared across the whole application through the Store, in which case (but only in that case) you should try to manage change without side effects and following basic immutability rules. As a rule of thumb, Modules should manage shared application state in an immutable way.

### Components

* Avoid nesting component definitions, to avoid creating stale closures. Only define components within other components if you are not relying on changes affecting variables defined in the outer component within the inner component.
* Component should only mutate their own local state.
* Pay attention when relying on captured variables in event handlers, as they may become stale. In certain situations, you can pass data to event handlers through the DOM instead.
  * Add identifiers to the real DOM and use `event.currentTarget` in event handlers.
  * Use dataset to store identfiers in the real DOM.


### Screens

* Use screens for complex, stateful components orchestrating nested "dumb" components.
* Store event subscription destructors in the screen state and call them in the `teardown` method.
* Return an object from the `teardown` method to preserve route state across screens, only if needed. 
* Use the `setup` method to define local, screen-level state that will be accessible in the `display` method.

### State Management

* Application state should be stored in the H3 store and should not be mutated.
* Use mutable objects for non-stored local state.
* Use screen state to share data among complex components hierarchies.
* Define separate model classes for complex objects.
* Move complex data manipulation logic to model classes.
* Use url parts and params as an easy way to keep references to recreate application state.