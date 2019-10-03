"use strict";
import ScreenTransition from './ScreenTransition';

/**
 * @typedef screenFactoryFunction
 * @param {string} id
 * @param {object} state
 * @param {HTMLElement} container Element to populate with contests of screen represented by id in state
 * @return {Screen}
 */

 /** 
 * @typedef getStateFunction
 * @return {object}
 */

 /**
  * @typedef disconnectFunction
  * @param {HTMLElement} container Same container that was passed to the screenFactoryFunction
  */

 /**
 * @typedef Screen
 * @property {getStateFunction} getState
 * @property {function} disconnect
 */

/**
 * 
 */
export class NavigationItem {
  /**
   * @param {Navigator} parent
   * @param {string} id
   * @param {getStateFunction} getState,
   * @param {HTMLElement} [element]
   */
  constructor(parent, id, state, options) {
    options = {
      transition: parent.transition,
      viewportScroll: {x:0, y:0},
      ...options
    }

    /** @property {string} */
    this.id = id;

    

    this.parent = parent;
    this._stateValue = state;
    this._hydrated = null;
    this._element = null;

    /** @property {object} */
    this.viewportScroll = options.viewportScroll;

    /** @property {ScreenTransition} */
    this.transition = options.transition;
  }

  get isHydrated() {
    return null != this._hydrated;
  }

  getState() {
    if( ! this.isHydrated  || ! this._hydrated.getState) 
      return this._stateValue; 
  
    const s = this._hydrated.getState() || {};
    return s;
  }

  preserveState() {
    this._stateValue = this.getState();
    this.viewportScroll = this.parent.getViewportScroll(this.frameId);
  }

  /**
   * Get the currently hydrated element representing this screen, or hydrate
   * a new element
   * @return {HTMLElement}
   */
  hydrate() {
    if (this._hydrated || ! this.parent.screenFactory) 
      return this._element;

    this._element = document.createElement('div');
    this._element.setAttribute('slot', this.frameId);
    this.parent.appendChild(this._element);

    const r  = this.parent.screenFactory(this.id, this._stateValue, this._element);

    if( ! r)
      throw new Error('screen factory did not return a value');
    if( 'function' != typeof r.getState)
      throw new Error('screen factory did not return an object with a getState function');

    this.parent.setViewportScroll(this.frameId, this.viewportScroll);

    this._hydrated = r;
    this._stateValue = null;
  }

  /**
   * 
   */
  dehydrate() {
    if(null == this._hydrated)
      return;

    if('function' == typeof this._hydrated.disconnect)
      this._hydrated.disconnect(this._element)

    this._element.parentElement.removeChild(this._element);

    this._hydrated = null;
    this._element = null;
  }
}

export default NavigationItem;