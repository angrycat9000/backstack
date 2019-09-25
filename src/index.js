import {html, LitElement, css} from 'lit-element';
import {render} from 'lit-html';

import Navigation, { ScreenTransition } from './webapp-navigation';

console.log('ready');

class Screen extends LitElement {
  construtor() {
    this.template = null;
  }
  
  static get styles() {
    return css`div{
      background:white; 
      height:100%;
      width:100%;
      position:absolute;
    }`
  }

  render() {
    return html`<div><slot></slot></div>`;
  }

  set template(value) {
    render(value, this);
  }
}
window.customElements.define('wam-screen', Screen);

function screenFactory(id, state) {
  console.log(`building screen for ${id}`, state);

  const screen = document.createElement('wam-screen');

  switch(id) {
    case 'home':
      screen.template = html`<h1>Home</h1>
        <a href="view" @click=${click}>View</a><br>
        <a href="edit" data-transition="slide-up" @click=${click}>Edit</a><br>
        <a href="view" data-transition="zoom-in" @click=${click}>Zoom</a><br>
        <a href="view" data-transition="fade-in" @click=${click}>Fade</a>`;
      break;
    case 'edit':
      screen.template = html`<h1><button @click=${back}>Back</button> Edit</h1><p>Edit ${state.id}</p>`;
      break;
    case 'view':
      screen.template = html`
        <h1><button @click=${back}>Back</button> ${state.id}</h1>
        <p>View ${state.id}</p>
        <a @click=${click} href="view-details">Details</a>`;
      break;
    case 'view-details':
      screen.template = html`<h1><button @click=${back}">Back</button>Details</button></h1>`;
      break;
  }

  return {element:screen, getState:function(){return state}};
}

function showScreen(id, state) {
  console.log('before', navigator.getState())

  .then(()=>{console.log('Push Done')})
  console.log('after', navigator.getState())
}

function click(event) {
  const transition = event.currentTarget.getAttribute('data-transition') || ScreenTransition.SlideLeft;
  const id = event.currentTarget.getAttribute('href')
  navigator.push(id, {id:transition}, {transition:transition})
  event.preventDefault();
}

function back() {
  if(navigator.previous)
    navigator.back().then(()=>console.log('Back Done'))
  else
    navigator.set('home',{}).then(()=>console.log('Back-Set Done'))

}

var navigator = document.createElement('wam-navigator');
navigator.screenFactory = screenFactory;
window.wamNavigator = navigator;
document.body.appendChild(navigator);



function run() {
  navigator.set('home',{}).then(()=>console.log('Init'))
}

if('loading' == document.readyState) {
  window.addEventListener('DOMContentLoaded', run);
} else {
  run();
}