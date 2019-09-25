"use strict";
import ScreenTransition from './ScreenTransition';

/**
 * @typedef screenFactoryFunction
 * @param {string} id
 * @param {object} state
 * @return {Screen}
 */

 /** 
 * @typedef getStateFunction
 * @return {object}
 */

 /**
 * @typedef Screen
 * @property {HTMLElement} element
 * @property {getStateFunction} getState
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
      keepAlive:false,
      //isOverlay: false,
      transition: ScreenTransition.None,
      element:null,
      ...options
    }

    /** @property {string} */
    this.id = id;
    this._stateValue = state;
    this._element = null;
    this._stateFunc = null;

    /** @property {boolean} */
    this.keepAlive = options.keepAlive;

    /** @property {boolean} */
    //this.isOverlay = options.isOverlay;

    /** @property {ScreenTransition} */
    this.transition = options.transition;
  }

  get isHydrated() {
    return null != this._element
  }

  get element() {return this._element}

  getState() {
    return this.isHydrated ? (this._stateFunc && this._stateFunc()) : this._stateValue;
  }

  /**
   * Get the currently hydrated element representing this screen, or hydrate
   * a new element
   * @param {screenFactoryFunction}
   * @return {HTMLElement}
   */
  getElement(factory) {
    if ( ! this._element && factory) {
      const r = factory(this.id, this._stateValue);

      if( !r)
        throw new Error('screen factory did not return a value');
      if( 'function' != typeof r.getState)
        throw new Error('screen factory did not return an object with a getState function');
      if( ! (r.element instanceof HTMLElement))
        throw new Error('screen factory did not return an object with an element property set to an HTMLElement object');

      this._element = r.element;
      this._stateFunc = r.getState;
      this._stateValue = null;
    }
    return this._element;
  }

  /**
   * @return {HTMLElement|null} previously hydrated element or none
   */
  dehydrate() {
    const element = this._element;
    this._stateValue = this.getState();
    this._stateFunc = null;
    this._element = null;
    return element;
  }
}

export default NavigationItem;