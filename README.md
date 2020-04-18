[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/backstack)


# Backstack

Animated, stateful, and simple single page app functionality for use with Cordova. 

This component includes the ability to **save and restore state**.  This is important for Cordova Android apps which may get shutdown in the background.  This component allows the app to restore the screen history when the app is reloaded. Other SPA and router frameworks that rely on the built in browser history lose that history after the app is reloaded. 

[Live Demo @ backstack.netlify.com](https://backstack.netlify.com/)

[API Documentation](https://backstack.netlify.com/docs/)

## Installation

This assumes it will be bundled in a larger package using webapp, rollup, or another bundler.  It requires LitElement to be available as a peer dependency.  No polyfills included.

```
npm install --save backstack
```


## Usage

```html
<backstack-manager id="myApp"></backstack-manager>
```

Set the screen factory property in JavaScript.  Optionally set the transition property as well for the default transition.

```javascript
import {ScreenTransition} from 'backstack';

const nav = document.getElementById('myApp');

// see screen factory function section for more details
nav.screenFactory = (id, state, container)=>{
  return {getState:function() {}}; 
}
```

### Navigator Functionality

These examples show basic usage.  Consult the [API documentation](https://backstack.netlify.com/docs/) for more details.

#### transition

Set the default transition to use.  Individual operations can override this in options.

```javascript
nav.transition = ScreenTransition.SlideLeft;
```

#### push(id, state, [options])
Show new screen.  Save the history of previous screens.

```javascript
nav.push('simple-screen', {counter:5});
```

#### set(id, state, [options])

Show the new screen and clear out all screen history.

```javascript
nav.set('simple-screen', {counter:5});
```

#### back()

Hide the current screen and show the previous screen in the history.

```javascript
nav.back()
```

#### getState() and setState()
Saving and restoring state.
```javascript
const state = nav.getState();
nav.setState(state);
```

### Screen Factory Function

You must implement a function to provide the contents of your screens to the navigator.  This function has two responsiblities:

* Populate the `HTMLElement container` with the contents of the screen represented by `state` and `id`.
* Provide callbacks for getting the current state of the screen and other lifecycle operations.

The return value is an object with at least one function, `getState`. This is the function should return any state that needs to be saved for the screen that was just created.

You can also include a disconnect function if you need to do cleanup when the screen is removed.

```javascript
const e = document.getElementById('myApp');
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