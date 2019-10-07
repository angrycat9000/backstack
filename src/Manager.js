"use strict";
import ScreenTransition from './ScreenTransition';
import NavigationItem from './NavigationItem';
import {LitElement, html, css} from 'lit-element';

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
 * @typedef Options
 * @property {ScreenTransition} [transition]
 * @property {ScrollValues} [viewportScroll] 
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
    this._transitionName = '';
    this._transitionTarget = '';
    this._baseScreenId = '';

    /** 
     * Default transition that is used if no transition is provided by the {@link Options}
     * @type {ScreenTransition} 
     */
    this.transition = ScreenTransition.None;
  }

  static get properties() {
    return { 
      _transitionName: {type: String},
      _transitionTarget: {type:String},
      _baseScreenId: {type: String},
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
   * @param {number} viewportId
   * @return {ScrollValues}
   * @private
   */
  getViewportScroll(viewportId) {
    const frame = this.shadowRoot.querySelector(`slot[name="${viewportId}"]`);
    if( ! frame)
      throw new Error(`Cannot find viewport with id = "${viewportId}"`);
    return {x:frame.parentElement.scrollLeft, y:frame.parentElement.scrollTop}
  }
  /**
   * @param {number} viewportId
   * @param {ScrollValues} value
   * @private
   */
  setViewportScroll(viewportId, value) {
    const frame = this.shadowRoot.querySelector(`slot[name="${viewportId}"]`);
    if( ! frame)
      throw new Error(`Cannot find viewport with id = "${viewportId}"`);
    frame.parentElement.scrollLeft = value && value.x ? value.x : 0;
    frame.parentElement.scrollTop =  value && value.y ? value.y : 0;
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
   * Show a new screen, maintaining previous screens in the history stack.
   * @param {string} id identifier passed to {@link screenFactoryFunction}
   * @param {object} state passed to {@link screenFactoryFunction}
   * @param {Options} [options]
   * @return {Promise<ScreenChange>}
   */
  push(id, state, options) {
    const next = new NavigationItem(this, id, state, options);

    const from = this.current;
    this._stack.push(next);
    next.viewportId = this._stack.length;
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
    const newScreen = new NavigationItem(this, id,state,options);
    const previous = this.current;
    for(let i = 0; i < this._stack.length -1; i++) {
      const item = this._stack[i];
      item.dehydrate();
    }

    this._stack = [newScreen];
    newScreen.viewportId = this._stack.length;

    return this.animateIn(newScreen, previous)
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

    const next = new NavigationItem(this, id,state,options);
    this._stack.push(next);
    next.viewportId = this._stack.length;
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
      stack:this._stack.map((item)=>{return {
        state: item.getState(),
        id: item.id,
        transition: item.transition,
        viewportScroll: item.viewportScroll
      }})
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
    
    this._stack = state.stack.map((item,i) => {
      const options = {transition:item.transition, viewportScroll: item.viewportScroll}
      const ni = new NavigationItem(this, item.id, item.state, options);
      ni.viewportId = i+1;
      return ni;
    });

    this._baseScreenId = this._stack.length;
    this._transitionName = '';
    this._transitionTarget = '';
    this.transition = state.transition || ScreenTransition.None;

    return this.updateComplete.then(()=>{
      this.current.hydrate();
    });
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

    if(entering.transition == ScreenTransition.None) {
      this._baseScreenId = entering.viewportId;
      return this.updateComplete
      .then(()=>{
        entering.hydrate(this);
        if(previous)
          previous.dehydrate();

        return {from:previous, to:entering, controller:this};
      })
    }

    this._baseScreenId = previous ? previous.viewportId : 'none';
    this._transitionName = entering.transition;
    this._transitionTarget = entering.viewportId || 'none';
    return this.updateComplete
    .then(()=>{
      entering.hydrate(this);
      if(previous)
        this.setViewportScroll(previous.viewportId, previous.viewportScroll);
      return awaitAnimationFrame()})
    .then(awaitAnimationFrame)
    .then(()=>new Promise((resolve,reject)=>{
        this._transitionName = '';
        this.afterTransition = resolve
      }))
    .then(()=>{
      this._transitionTarget = '';
      this._baseScreenId = entering.viewportId;
      return this.updateComplete;
    })
    .then(()=>{
      if(previous)
        previous.dehydrate();
      this.setViewportScroll(entering.viewportId, entering.viewportScroll);
      return {from:previous, to:entering, controller:this}
    });
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

    if(leaving.transition == ScreenTransition.None) {
      this._baseScreenId = next.viewportId;
      return this.updateComplete
      .then(()=>{
        if(next)
          next.hydrate(this);
        leaving.dehydrate();
        return {from:leaving, to:next, controller:this};
      })
    }

    this._transitionTarget = leaving.viewportId;
    this._transitionName = '';
    this._baseScreenId = next ? next.viewportId : 'none';
    return this.updateComplete
    .then(()=>{
      if(next)
        next.hydrate(this);
      return awaitAnimationFrame()})
    .then(awaitAnimationFrame)
    .then(()=>new Promise((resolve,reject)=>{
        this._transitionName = leaving.transition;
        this.afterTransition = resolve
    }))
    .then(()=>{
      this._transitionTarget = '';
      this._baseScreenId = next.viewportId;
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
    return html`
      <div id="base" class="screen">
        <slot name="${this._baseScreenId}"></slot>
      </div>
      ${this._transitionTarget ? 
          html`<div id="motion" 
                    class="screen ${this._transitionName}"
                    @transitionend=${this.transitionEnd}
                    @transitioncancel=${this.transitionEnd}>
                <slot name="${this._transitionTarget}"></slot>
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
      transition: transform 0.5s, opacity 0.5s;
      position: absolute;
      top: 0;
      left: 0;
      transform: translate3d(0, 0, 0);
      animation-fill-mode: forwards;
      overflow: auto;
      background: var(--screen-background, radial-gradient(circle, rgba(255,255,255,1) 15%, rgba(233,233,233,1) 85%));
    }
    .slide-left {transform: translate3d(100%, 0, 0)}
    .slide-right {transform: translate3d(-100%, 0, 0)}
    .slide-up {transform:translate3d(0,100%,0)}
    .slide-down {transform:translate3d(0,-100%,0)}
    .zoom-in {transform:scale(0.01); opacity:0}
    .fade-in {opacity:0;}`;}
}
window.customElements.define('backstack-manager', Manager);

function jsonScreenFactory(id, state, container) {
  container.innerHTML = `<h1>State for '${id}'</h1><pre>${JSON.stringify(state)}</pre>`;
  return {getState:function() {return state}};
}

function awaitAnimationFrame() {
  return new Promise((resolve,reject)=>{window.requestAnimationFrame(resolve)});
}

export default Manager;