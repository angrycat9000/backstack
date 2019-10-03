"use strict";
import ScreenTransition from './ScreenTransition';
import NavigationItem from './NavigationItem';
import {LitElement, html, css} from 'lit-element';

/**
 * @typedef NavigationEvent
 * @property {NavigationItem} from
 * @property {NavigationItem} to 
 * @property {Navigator} controller
 */

/**
 * 
 */
export class Navigator extends LitElement  {
  constructor() {
    super();

    this.screenFactory = jsonScreenFactory;
    this._stack = [];
    this.transitionName = '';
    this.transitionTarget = '';
    this.baseScreenId = '';
  }

  static get properties() {
    return { 
      transitionName: {type: String},
      transitionTarget: {type:String},
      baseScreenId: {type: String}
    };
  }

  /** @property {NavigationItem} */
  get current() {
    const length = this._stack.length;
    return length > 0 ? this._stack[length - 1] : null;
  }

  getViewportScroll(frameId) {
    const frame = this.shadowRoot.querySelector(`slot[name="${frameId}"]`);
    if( ! frame)
      throw new Error(`Cannot find frame with id = "${frameId}"`);
    return {x:frame.parentElement.scrollLeft, y:frame.parentElement.scrollTop}
  }
  setViewportScroll(frameId, value) {
    const frame = this.shadowRoot.querySelector(`slot[name="${frameId}"]`);
    if( ! frame)
      throw new Error(`Cannot find frame with id = "${frameId}"`);
    frame.parentElement.scrollLeft = value && value.x ? value.x : 0;
    frame.parentElement.scrollTop =  value && value.y ? value.y : 0;
  }

  /** @property {NavigationItem} */  
  get previous() {
    const length = this._stack.length;
    return length > 1 ? this._stack[length - 2] : null;
  }

  /**
   * @param {string} id
   * @param {object} state
   * @param {object} [options]
   * @param {ScreenTransition} [options.transition]
   * @param {boolean} [options.keepAlive]
   * @return Promise<NavigationEvent>
   */
  push(id, state, options) {
    const next = new NavigationItem(this, id, state, options);

    const from = this.current;
    this._stack.push(next);
    next.frameId = this._stack.length;
    return this.animateIn(next, from);
  }

  /**
   * 
   */
  set(id, state, options) {
    const newScreen = new NavigationItem(this, id,state,options);
    const previous = this.current;
    for(let i = 0; i < this._stack.length -1; i++) {
      const item = this._stack[i];
      item.keepAlive = false;
      item.dehydrate();
    }

    this._stack = [newScreen];
    newScreen.frameId = this._stack.length;

    return this.animateIn(newScreen, previous)
  }

  /**
   * 
   */
  replace(id, state, options) {
    if(this._stack.length < 1)
      return this.set(id, state, options);
    
    const previous = this._stack.pop();

    const next = new NavigationItem(this, id,state,options);
    this._stack.push(next);
    next.frameId = this._stack.length;
    return this.animateIn(next, previous)
  }

  /**
   * @return Promise<NavigationEvent>
   */
  back(transition) {
    if (this._stack.length < 2)
      return Promise.reject('Not enough screens to go back');

    const from = this._stack.pop();
    const to = this.current;

    return this.animateOut(from, to);
  }

  getState() {
    return this._stack.map((item)=>{return {
      state: item.getState(),
      id: item.id,
      transition: item.transition,
      viewportScroll: item.viewportScroll
    }});
  }

  setState(state) {
    
  }


   /**
   * @param {NavigationItem} entering
   * @param {NavigationItem} previous
   * @return Promise<NavigationEvent>
   */
  animateIn(entering, previous) {
    if( ! entering)
      return Promise.reject('Cannot animate in nothing');

    if(previous)
      previous.preserveState();

    if(entering.transition == ScreenTransition.None) {
      this.baseScreenId = entering.frameId;
      return this.updateComplete
      .then(()=>{
        entering.hydrate(this);
        if(previous)
          previous.dehydrate();

        return {from:previous, to:entering, controller:this};
      })
    }

    this.baseScreenId = previous ? previous.frameId : 'none';
    this.transitionName = entering.transition;
    this.transitionTarget = entering.frameId || 'none';
    return this.updateComplete
    .then(()=>{
      entering.hydrate(this);
      if(previous)
        this.setViewportScroll(previous.frameId, previous.viewportScroll);
      return awaitAnimationFrame()})
    .then(awaitAnimationFrame)
    .then(()=>new Promise((resolve,reject)=>{
        this.transitionName = '';
        this.afterTransition = resolve
      }))
    .then(()=>{
      this.transitionTarget = '';
      this.baseScreenId = entering.frameId;
      return this.updateComplete;
    })
    .then(()=>{
      if(previous)
        previous.dehydrate();
      this.setViewportScroll(entering.frameId, entering.viewportScroll);
      return {from:previous, to:entering, controller:this}
    });
  }

   /**
   * @param {NavigationItem} leaving
   * @param {NavigationItem} next
   * @return Promise<NavigationEvent>
   */
  animateOut(leaving, next) {
    if( ! leaving)
      return Promise.reject('Cannot animate out nothing');

    leaving.preserveState();

    if(leaving.transition == ScreenTransition.None) {
      this.baseScreenId = next.frameId;
      return this.updateComplete
      .then(()=>{
        if(next)
          next.hydrate(this);
        leaving.dehydrate();
        return {from:leaving, to:next, controller:this};
      })
    }

    this.transitionTarget = leaving.frameId;
    this.transitionName = '';
    this.baseScreenId = next ? next.frameId : 'none';
    return this.updateComplete
    .then(()=>{
      if(next)
        next.hydrate(this);
      return awaitAnimationFrame()})
    .then(awaitAnimationFrame)
    .then(()=>new Promise((resolve,reject)=>{
        this.transitionName = leaving.transition;
        this.afterTransition = resolve
    }))
    .then(()=>{
      this.transitionTarget = '';
      this.baseScreenId = next.frameId;
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
        <slot name="${this.baseScreenId}"></slot>
      </div>
      ${this.transitionTarget ? 
          html`<div id="motion" 
                    class="screen ${this.transitionName}"
                    @transitionend=${this.transitionEnd}
                    @transitioncancel=${this.transitionEnd}>
                <slot name="${this.transitionTarget}"></slot>
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
window.customElements.define('wam-navigator', Navigator);

function jsonScreenFactory(id, state) {
  const div = document.createElement('div');
  div.innerHTML = `<h1>State for '${id}'</h1><pre>${JSON.stringify(state)}</pre>`;
  return {element:div, getState:function() {return state}};
}

function awaitAnimationFrame() {
  return new Promise((resolve,reject)=>{window.requestAnimationFrame(resolve)});
}

export default Navigator;