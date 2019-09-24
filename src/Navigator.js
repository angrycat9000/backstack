"use strict";
import ScreenTransition from './ScreenTransition';
import NavigationItem from './NavigationItem';



/**
 * @typedef NavigationEvent
 * @property {NavigationItem} from
 * @property {NavigationItem} to 
 * @property {ScreenTransition} transition
 */

/**
 * 
 */
export class Navigator{
  constructor() {
    //super();
    this._stack = [];
    this.screenFactory = jsonScreenFactory;
    this.root = document.body;
  }

  static create() {
    return new Navigator();
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
   * @param {ScreenTransition} [options.transition]
   * @param {boolean} [options.keepAlive]
   * @return Promise<NavigationEvent>
   */
  push(id, state, options) {
    const next = new NavigationItem(id, state, options);

    const from = this.current;
    this._stack.push(next);
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
        this.root.removeChild(previous.element);
    }

    this._stack.push(newScreen);

    this.animateIn(newScreen, this.current)
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

    if('undefined' == typeof transition && from)
      transition = -from.transition;

    return this.animateOut(from, to);
  }

  /**
   * @param {NavigationItem} entering
   * @param {NavigationItem} previous
   * @return Promise<NavigationEvent>
   */
  animateIn(entering, previous) {
    const newElement = entering.getElement(this.screenFactory); 
    this.root.appendChild(newElement);

    if (previous && ! entering.isOverlay && ! previous.keepAlive) {
      const oldElement = previous.dehydrate();
      if(oldElement && oldElement.parentElement)
        this.root.removeChild(oldElement);
    }

    return Promise.resolve({previous,entering});
  }

  /**
   * @param {NavigationItem} leaving
   * @param {NavigationItem} next
   * @return Promise<NavigationEvent>
   */
  animateOut(leaving, next) {
      if ( ! leaving.keepAlive) {
        const oldElement = leaving.dehydrate();
        if(oldElement && oldElement.parentElement)
          this.root.removeChild(oldElement);
      }

    this.root.appendChild(next.getElement(this.screenFactory));

    return Promise.resolve({leaving, next});
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

}
window.customElements.define('wam-navigator', Navigator);

function jsonScreenFactory(id, state) {
  const div = document.createElement('div');
  div.innerHTML = `<h1>State for '${id}'</h1><pre>${JSON.stringify(state)}</pre>`;
  return {element:div, getState:function() {return state}};
}


export default Navigator;