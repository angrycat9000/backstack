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
   * @param {string} id
   * @param {getStateFunction} getState,
   * @param {HTMLElement} [element]
   */
  constructor(id, state, options) {
    options = {
      transition: ScreenTransition.None,
      ...options
    }

    /** @property {string} */
    this.id = id;
    this._stateValue = state;
    this._hydrated = null;
    this._element = null;

    /** @property {boolean} */
    this.keepAlive = options.keepAlive;

    /** @property {boolean} */
    //this.isOverlay = options.isOverlay;

    /** @property {ScreenTransition} */
    this.transition = options.transition;
  }

  get isHydrated() {
    return null != this._hydrated;
  }

  getState() {
    return this.isHydrated  && this._hydrated.getState ? this._hydrated.getState() : this._stateValue;
  }

  preserveState() {
    this._stateValue = this.getState();
  }

  /**
   * Get the currently hydrated element representing this screen, or hydrate
   * a new element
   * @param {Navigator} parent
   * @return {HTMLElement}
   */
  hydrate(parent) {
    if (this._hydrated || ! parent || !parent.screenFactory) 
      return this._element;

    this._element = document.createElement('div');
    this._element.setAttribute('slot', this.frameId);
    parent.appendChild(this._element);

    const r  = parent.screenFactory(this.id, this._stateValue, this._element);

    if( ! r)
      throw new Error('screen factory did not return a value');
    if( 'function' != typeof r.getState)
      throw new Error('screen factory did not return an object with a getState function');

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