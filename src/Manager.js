"use strict";
import ScreenTransition from './ScreenTransition';
import NavigationItem from './NavigationItem';
import {LitElement, html, css} from 'lit-element';

const TEMP_OVERLAY = 'temp-overlay';
const TEMP_SET = 'temp-set';

/**
 * @callback screenFactoryFunction
 * @param {string} id 
 * @param {object} state Memento object representing the state of the screen.  Provided by the call to  {@link Manager#push}, {@link Manager#set}, {@link Manager#replace}, or {@link Screen#getState}
 * @param {HTMLElement} container Element to populate with contests of screen represented by id in state
 * @return {Screen}
 */

 /** 
 * Called to ask a screen for what its current state is.  Typically right before it is removed from the DOM.
 * @callback getStateFunction
 * @return {object}
 */

 /**
  * @callback disconnectFunction
  * @param {HTMLElement} container Same container that was passed to the screenFactoryFunction
  */

 /**
 * @typedef Screen
 * @property {getStateFunction} getState
 * @property {disconnectFunction} [disconnect]
 */

 
/**
 * @typedef ScrollValues
 * @property {number} x
 * @property {number} y
 */


/**
 * @typedef ScreenChange
 * @property {NavigationItem} from
 * @property {NavigationItem} to 
 * @property {Manager} controller
 */

/**
 * @typedef ItemState
 * @property {object} state
 * @property {string} id
 * @property {ScreenTransition} transition
 * @property {ScrollValues} viewportScroll
*/

/**
 * @typedef NavigatorState
 * @property {ScreenTransition} transition
 * @property {Array<ItemState>} stack
 */

/**
 * Web component to manage display of pages or screens in a 
 * single page application for Cordova.
 */
export class Manager extends LitElement  {
  /**
   * **Do not use constructor directly**.  This is a custom HTMLElement and should
   * be created using `document.createElement`.
   * @example
   * let s = document.createElement('backstack-manager');
   * s.screenFactory = someFunction;
   * @hideconstructor
   */
  constructor() {
    super();

    /**
     * Callback responsible for populating screens given an id and state
     * @type {screenFactoryFunction}  
     */
    this.screenFactory = jsonScreenFactory;
    this._stack = [];
    this._targetTransition = '';
    this._targetId = '';
    this._baseTransition = '';
    this._baseId = '';
    this._isAnimating = false;

    this._busy = false;

    /** 
     * Default transition that is used if no transition is provided by the {@link Options}
     * @type {ScreenTransition} 
     */
    this.transition = ScreenTransition.None;
  }

  static get properties() {
    return { 
      _targetTransition: {type: String},
      _targetId: {type:String},
      _baseTransition: {type:String},
      _baseId: {type: String},
      _isAnimating: {type:Boolean},
      transition: {type:String, attribute:"transition"}
    };
  }

  /** 
   * Top most screen in the history stack.
   * @type {NavigationItem}
   */
  get current() {
    const length = this._stack.length;
    return length > 0 ? this._stack[length - 1] : null;
  }

  /**
   * Previous screen in the navigation stack, or null
   * @type {NavigationItem} 
   */  
  get previous() {
    const length = this._stack.length;
    return length > 1 ? this._stack[length - 2] : null;
  }

  /**
   * Set the viewport id and put the item on the stack
   * @param {NavigationItem} item
   * @private
   */
  pushNextItem(item) {
    let id = this.current ? this.current.viewportId : 0;
    if( ! item.isOverlay)
      id++;
    item.viewportId = id;
    
    this._stack.push(item);
  }

  /**
   * Show a new screen, maintaining previous screens in the history stack.
   * @param {string} id identifier passed to {@link screenFactoryFunction}
   * @param {object} state passed to {@link screenFactoryFunction}
   * @param {Options} [options]
   * @return {Promise<ScreenChange>}
   */
  push(id, state, options) {
    const next = new NavigationItem(this, id, state, options);

    const from = this.current;
    this.pushNextItem(next);
    return this.animateIn(next, from);
  }

  /**
   * Replace the current screen, erasing the history stack.
   * @param {string} id identifier passed to {@link screenFactoryFunction}
   * @param {object} state passed to {@link screenFactoryFunction}
   * @param {Options} [options]
   * @return {Promise<ScreenChange>}
   */
  set(id, state, options) {
    const newScreen = new NavigationItem(this, id, state, options);
    const previous = this.current;
    const oldStack = this._stack;
    this._stack = [];
    this.pushNextItem(newScreen);
    newScreen.tempViewportId = TEMP_SET;

    return this.animateIn(newScreen, previous)
    .then(()=>{
      for(const item of oldStack)
        item.dehydrate();

      return {from:previous, to:newScreen, controller:this};
    })
  }

  /**
   * Replace the current screen with a new one. Leaves the rest of the history
   * stack unchanged.
   * @param {string} id identifier passed to {@link screenFactoryFunction}
   * @param {object} state passed to {@link screenFactoryFunction}
   * @param {Options} [options]
   * @return {Promise<ScreenChange>}
   */
  replace(id, state, options) {
    if(this._stack.length < 1)
      return this.set(id, state, options);
    
    const previous = this._stack.pop();

    const next = new NavigationItem(this, id, state, options);
    next.tempViewportId = TEMP_SET;
    this.pushNextItem(next);
    return this.animateIn(next, previous)
  }

  /**
   * Remove the current screen from the stack and show the one below it.
   * @return {Promise<ScreenChange>}
   */
  back() {
    if (this._stack.length < 2)
      return Promise.reject('Not enough screens to go back');

    const from = this._stack.pop();
    const to = this.current;
    return this.animateOut(from, to);
  }

  /**
   * @memberof Manager
   * @return {NavigatorState}
   */
  getState() {
    return {
      transition: this.transition,
      stack:this._stack.map((item)=>{
        const itemState =  {
          state: item.getState(),
          id: item.id,
          transition: item.transition,
          viewportScroll: item.viewportScroll
        };
        if(item.isOverlay)
          itemState.isOverlay = true;
        
        return itemState;        
      })
    } 
  }


  /**
   * Replace the current screen and history stack with the provided state
   * @param {NavigatorState}
   * @return {Promise}
   */
  setState(state) {
    if( ! state)
      throw new Error('Cannot set empty state');

    if( ! Array.isArray(state.stack))
      throw new Error('state.stack should be an array');

    for(let i = 0; i < this._stack.length; i++) {
      const item = this._stack[i];
      item.dehydrate();
    }
    var viewport = 0;
    this._stack = state.stack.map((item,i) => {
      const options = {
        transition:item.transition, 
        viewportScroll: 
        item.viewportScroll,
        isOverlay:item.isOverlay
      }
      const ni = new NavigationItem(this, item.id, item.state, options);
      if( ! ni.isOverlay)
        viewport++;
      ni.viewportId = viewport;
      return ni;
    });

    this._baseId = this._stack.length;
    this._baseTransition = '';
    this._targetId = '';
    this._targetTransition = ''
    this.transition = state.transition || ScreenTransition.None;

    this.fireScreenEvent(null, this.current);

    return this.updateComplete.then(()=>{
      this.hydrateViewport(this.current.viewportId);
    });
  }


  /**
   * Raise the 'screen' event when the screen changes
   * @param {NavigationItem} from
   * @param {NavigationItem} to
   * @private
   */
  fireScreenEvent(from, to) {
    const e = new CustomEvent('screen', {detail: {from, to}});
    this.dispatchEvent(e);
  }


   /**
   * @param {NavigationItem} entering
   * @param {NavigationItem} previous
   * @return {Promise<ScreenChange>{}
   * @private
   */
  animateIn(entering, previous) {
    if( ! entering)
      return Promise.reject('Cannot animate in nothing');

    if(previous)
      previous.preserveState();

    this.fireScreenEvent(previous, entering);

    if( ! entering.transition) {
      this._baseId = entering.viewportId;
      return this.updateComplete
      .then(()=>{
        entering.tempViewportId = null;
        entering.hydrate();
        if(previous && ! entering.isOverlay)
          previous.dehydrate();

        return {from:previous, to:entering, controller:this};
      })
    }

    const transitions = parseTransitions(entering.transition);

    if(entering.isOverlay) {
      entering.tempViewportId = TEMP_OVERLAY;
      transitions.base = '';
    }

    this._baseId = previous ? previous.viewportId : 'none';
    this._baseTransition = '';
    this._targetTransition = transitions.target;
    this._targetId = entering.slot;

    return this.updateComplete
    .then(()=>{
      entering.hydrate();
      return awaitAnimationFrame()})
    .then(awaitAnimationFrame)
    .then(()=>new Promise((resolve,reject)=>{
        this._isAnimating = true;
        this._targetTransition = '';
        this._baseTransition = transitions.base;
        this.afterTransition = resolve
      }))
    .then(()=>{
      this._isAnimating = false;
      this._baseTransition = '';
      this._targetId = ''
      this._baseId = entering.viewportId;
      entering.tempViewportId = null;
      return this.updateComplete;
    })
    .then(()=>{
      if(previous && ! entering.isOverlay) {
        // always dehydrate the previous because it will be missed by this.dehydrateViewport if it isn't on the stack.
        previous.dehydrate(); 
        // if the previous viewport is now hidden, dehydrate all of the screens in it
        if(previous.viewportId !== entering.viewportId)
          this.dehydrateViewport(previous.viewportId);
      }
      return {from:previous, to:entering, controller:this}
    });
  }

  dehydrateViewport(id) {
    for(let item of this._stack) {
      if(id == item.viewportId)
        item.dehydrate();
    }
  }

  hydrateViewport(id) {
    for(let item of this._stack) {
      if(id == item.viewportId)
        item.hydrate();
    }
  }

   /**
   * @param {NavigationItem} leaving
   * @param {NavigationItem} next
   * @return {Promise<ScreenChange>}
   * @private
   */
  animateOut(leaving, next) {
    if( ! leaving)
      return Promise.reject('Cannot animate out nothing');

    leaving.preserveState();

    this.fireScreenEvent(leaving, next);

    if( ! leaving.transition) {
      this._baseId = next.viewportId;
      return this.updateComplete
      .then(()=>{
        this.hydrateViewport(next.viewportId);
        leaving.dehydrate();
        return {from:leaving, to:next, controller:this};
      })
    }

    const transitions = parseTransitions(leaving.transition);
    if(leaving.isOverlay) {
      leaving.tempViewportId = TEMP_OVERLAY;
      this._baseTransition = '';
    }

    this._targetId = leaving.slot;
    this._targetTransition = '';
    this._baseId = next ? next.viewportId : 'none';
    this._baseTransition = transitions.base;

    return this.updateComplete
    .then(()=>{
      this.hydrateViewport(next.viewportId);
      return awaitAnimationFrame()})
    .then(awaitAnimationFrame)
    .then(()=>new Promise((resolve,reject)=>{
        this._isAnimating = true;
        this._targetTransition = transitions.target
        this._baseTransition = '';
        this.afterTransition = resolve
    }))
    .then(()=>{
      this._isAnimating = false;
      this._targetTransition = '';
      this._baseId = next.viewportId;
      this._targetId = '';
      leaving.tempViewportId = null;
      return this.updateComplete;
    })
    .then(()=>{
      leaving.dehydrate();
      return {from:leaving, to:next, controller:this}
    })
  }

  transitionEnd(e) {
    if(this.afterTransition) {
      this.afterTransition();
      this.afterTransition = null;
    }
  }

  render() {
    var screenClass = this._isAnimating ? 'screen animating' : 'screen';
    return html`
      <div id="base" class="${screenClass} ${this._baseTransition}">
        <slot name="${this._baseId}"></slot>
      </div>
      ${this._targetId ? 
          html`<div id="target" 
                    class="${screenClass} ${this._targetTransition} ${this._targetId === TEMP_OVERLAY ? 'overlay' : ''}"
                    @transitionend=${this.transitionEnd}
                    @transitioncancel=${this.transitionEnd}>
                <slot name="${this._targetId}"></slot>
              </div>`: 
          html``
      }`;
  } 

  static get styles() {return css`
    :host {
      width: 100vw;
      height: 100vh;
      display: block;
      position: relative;
      overflow: hidden;
    }
    .screen {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transform: translate3d(0, 0, 0);
      animation-fill-mode: forwards;
      opacity: 1;
      overflow: auto;
      background: var(--screen-background, radial-gradient(circle, rgba(255,255,255,1) 15%, rgba(233,233,233,1) 85%));
    }
    .overlay {
      background:none;
    }
    .animating {
      transition: transform 0.5s, opacity 0.5s;
    }
    .slide-left {transform: translate3d(100%, 0, 0)}
    .slide-right {transform: translate3d(-100%, 0, 0)}
    .push-right {transform: translate3d(-100%, 0, 0)}
    .slide-up {transform:translate3d(0,100%,0)}
    .slide-down {transform:translate3d(0,-100%,0)}
    .zoom-in {transform:scale(0.01); opacity:0}
    .fade-in {opacity:0;}
    .fade-left {transform: translate3d(25%, 0, 0); opacity:0}
    .fade-right {transform: translate3d(-25%, 0, 0); opacity:0}
    .fade-up {transform: translate3d(0, 25%, 0); opacity:0}
    .fade-down {transform: translate3d(0, -25%, 0); opacity:0}
    `;}
}
window.customElements.define('backstack-manager', Manager);

function jsonScreenFactory(id, state, container) {
  container.innerHTML = `<h1>State for '${id}'</h1><pre>${JSON.stringify(state)}</pre>`;
  return {getState:function() {return state}};
}

function awaitAnimationFrame() {
  return new Promise((resolve,reject)=>{window.requestAnimationFrame(resolve)});
}

function parseTransitions(s) {
  if( ! s)
    return {target:'', base:''}
  const split = s.split('/');
  return {
    target:split[0],
    base: split.length > 1 ? split[1] : ''
  };
}

export default Manager;