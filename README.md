[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/backstack)


# Backstack

Animated, stateful and simple single page app functionality for use with Cordova. 

This component includes the ability to **save and restore state**.  This is important for Cordova Android apps which may get shutdown in the background.  This component allows the app to restore the screen history when the app is reloaded. Other SPA and router frameworks that rely on the built in browser history lose that history after the app is reloaded. 

[Live Demo @ backstack.netlify.com](https://backstack.netlify.com/)

[API Documentation](https://backstack.netlify.com/docs/)

## Installation

This assumes it will be bundled in a larger package using webapp, rollup, or another bundler.  It requires LitElement to be available as a peer dependency.  No polyfills included.

```
npm install backstack
```

```javascript
import {Manager, ScreenTransition} from 'backstack';
```


## Usage

```html
<backstack-manager id="myApp"><backstack-manager>
```

### Navigator Functions

Set the default transition to use for screen entry
```javascript
nav.transition = // a ScreenTransition value
```

Show the given screen, saving the history of previous screens.

```javavscript
nav.push(id, state, [options])
```

Show the given screen and clear out all screen history

```javascript
nav.set(id, state, [options])
```

Hide the current screen and show the previous screen in the history.

```javascript
nav.back([transition])
```
Saving and restoring state.
```
const state = nav.getState();
nav.setState(state);
```

### Screen Factory Function

You must implement a function to provide the contents of your screens to the navigator.

You need to populate the `HTMLElement` container with the contents of the screen represented by `state` and `id`.

The return value is an object with at least one function, `getState`. This is the function should return any state that needs to be saved for the screen that was just created.

You can also include a disconnect function if you need to do cleanup with the screen is removed.

```javascript
const e = document.getElementById('myApp'');
e.screenFactory = function(id, state, container) {
  switch(id) {
    case 'home':
      // add elements to container to represent home 
      // in the given state
    case 'other-screen':
      // add elements to container to represent 
      // other-screen in the given state

    return {
      getState: function() {
        // function that returns a memento object 
        // for the screen you just populated
      }
      disconnect: function() {
        // called when the elements are about to 
        // be removed from the DOM
      }
    }
  }
}
```