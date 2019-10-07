"use strict";

/**
 * Item on the history stack
 */
export class NavigationItem {
  /**
   * **Not for external use**.  Should only be called by {@link Manager}
   * @param {Manager} parent
   * @param {string} id
   * @param {object} state
   * @param {Options} [options]
   * @hideconstructor
   */
  constructor(parent, id, state, options) {
    options = {
      transition: parent.transition,
      viewportScroll: {x:0, y:0},
      ...options
    };

    /**  @type {string} */
    this.id = id;

    /** @type {Manager} */
    this.parent = parent;
    this._stateValue = state;
    this._hydrated = null;


    this._element = null;

    /** 
     * @type {number}
     * @private 
     */
    this.viewportId = -1;

    /** 
     * @type {ScrollValues}   
     * @private 
     */
    this.viewportScroll = options.viewportScroll;

    /** @type {ScreenTransition} */
    this.transition = options.transition;
  }

  /** 
   * @type {boolean}
   * @private
   */
  get isHydrated() {
    return null != this._hydrated;
  }

  /** 
   * Return the state of this screen.  Could be from the stored state if the screen is not active. 
   * Or the result of the {@link Screen#getState} callback
   * @return {object}
   */
  getState() {
    if( ! this.isHydrated  || ! this._hydrated.getState) 
      return this._stateValue; 
  
    const s = this._hydrated.getState() || {};
    return s;
  }

  /**
   * Stores the current state and viewport scroll info.
   * Needed to save the screen before it is disconnected.
   * @private
   */
  preserveState() {
    this._stateValue = this.getState();
    this.viewportScroll = this.parent.getViewportScroll(this.viewportId);
  }

  /**
   * Get the currently hydrated element representing this screen, or hydrate
   * a new element
   * @return {HTMLElement}
   * @private
   */
  hydrate() {
    if (this._hydrated || ! this.parent.screenFactory) 
      return this._element;

    this._element = document.createElement('div');
    this._element.setAttribute('slot', this.viewportId);
    this.parent.appendChild(this._element);

    const r  = this.parent.screenFactory(this.id, this._stateValue, this._element);

    if( ! r)
      throw new Error('screen factory did not return a value');
    if( 'function' != typeof r.getState)
      throw new Error('screen factory did not return an object with a getState function');

    this.parent.setViewportScroll(this.viewportId, this.viewportScroll);

    this._hydrated = r;
    this._stateValue = null;
  }

  /**
   * Removes this screen from the DOM and calls the disconnect method
   * @private
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