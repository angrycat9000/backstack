import Navigo from 'navigo';
import {html, LitElement} from 'lit-element';
import {render} from 'lit-html';

import Navigation from './src/webapp-navigation';

console.log('ready');

class Screen extends LitElement {
  construtor() {
    this.template = null;
  }
  
  render() {
    return html`<slot></slot>`;
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
      screen.template = html`<h1>Home</h1><a href="/view/test1" @click=${click}>Test 1 [View]</a><a href="/edit/test 2" @click=${click}>Test 2 [Edit]</a>`
      break;
    case 'edit':
      screen.template = html`<h1><button @click=${back}>Back</button> Edit</h1><p>Edit ${state.id}</p>`;
      break;
    case 'view':
      screen.template = html`
        <h1><button @click=${back}>Back</button> ${state.id}</h1>
        <p>View ${state.id}</p>
        <a @click=${click} href="/view/${state.id}/details">Details</a>`;
      break;
    case 'view-details':
      screen.template = html`<h1><button @click=${back}">Back</button>Details</button></h1>`;
      break;
  }

  return {element:screen, getState:function(){return state}};
}

function showScreen(id, state) {
  console.log('before', navigator.getState())
  navigator.push(id, state);
  console.log('after', navigator.getState())
}

function click(event) {
  const url = event.currentTarget.href;
  console.log(url);
  router.navigate(event.currentTarget.getAttribute('href'));
  event.preventDefault();
}

function back() {
  if(navigator.previous)
    navigator.back();
  else
    navigator.set('home',{})
  console.log('after', navigator.getState())
}

var navigator = new Navigation.Navigator();
navigator.screenFactory = screenFactory;
window.wamNavigator = navigator;



var router = new Navigo(null, true, '#!');
router
  .on('/', function(){
    showScreen('home')
  })
  .on('/edit/:id', function(params){
    showScreen('edit', {id:params.id});
  })
  .on('/view/:id', function(params){
    showScreen('view', {id:params.id});
  })
  .on('/view/:id/details', function(params) {
    showScreen('view-details', {id:params.id})
  })

function run() {
    router.resolve();
  }

if('loading' == document.readyState) {
  window.addEventListener('DOMContentLoaded', run);
} else {
  run();
}