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
    const next = new NavigationItem(id, state, options);

    const from = this.current;
    this._stack.push(next);
    next.frameId = this._stack.length;
    return this.animateIn(next, from);
  }

  /**
   * 
   */
  set(id, state, options) {
    const newScreen = new NavigationItem(id,state,options);
    while(this._stack.length) {
      const previous = this._stack.pop();
      if(previous.element && previous.element.parentElement)
        this.removeChild(previous.element);
    }

    this._stack.push(newScreen);
    newScreen.frameId = this._stack.length;

    return this.animateIn(newScreen, this.previous)
  }

  /**
   * 
   */
  replace(id, state, options) {
    if(this._stack.length < 1)
      return this.set(id, state, options);
    
    const previous = this._stack.pop();

    const next = new NavigationItem(id,state,options);
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
      keepAlive: item.keepAlive,
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

    const newElement = entering.getElement(this.screenFactory); 
    newElement.setAttribute('slot', entering.frameId);
    this.appendChild(newElement);

    if(entering.transition == ScreenTransition.None) {
      this.baseScreenId = entering.frameId;
      return this.updateComplete
      .then(()=>{
        if(previous &&  ! previous.keepAlive)
          this.removeElement(previous);

        return {from:previous, to:entering, controller:this};
      })
    }

    this.baseScreenId = previous ? previous.frameId : 'none';
    this.transitionName = entering.transition;
    this.transitionTarget = entering.frameId || 'none';
    return this.updateComplete
    .then(awaitAnimationFrame)
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
      if(previous &&  ! previous.keepAlive)
        this.removeElement(previous);
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

    const nextScreen = next.getElement(this.screenFactory);
    nextScreen.setAttribute('slot', next.frameId);
    this.appendChild(nextScreen);

    if(leaving.transition == ScreenTransition.None) {
      this.baseScreenId = next.frameId;
      return this.updateComplete
      .then(()=>{
        if(leaving &&  ! leaving.keepAlive)
          this.removeElement(leaving);

        return {from:leaving, to:next, controller:this};
      })
    }

    this.transitionTarget = leaving.frameId;
    this.transitionName = '';
    this.baseScreenId = next ? next.frameId : 'none';

    return this.updateComplete
    .then(awaitAnimationFrame)
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
      this.removeElement(leaving);
      return {from:leaving, to:next, controller:this}
    })
  }

  transitionEnd(e) {
    if(this.afterTransition) {
      this.afterTransition();
      this.afterTransition = null;
    }
  }

  removeElement(item) {
    const element = item.dehydrate();
    if(element && this == element.parentElement)
      this.removeChild(element);
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