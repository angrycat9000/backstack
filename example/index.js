import { ScreenTransition } from '../src/webapp-navigation';


function screenFactory(id, state) {

  let html;
  const clickLink = 'onclick="window.clickLink(event)"';
  const clickBack = 'onclick="clickBack(event)"'
  switch(id) {
    case 'home':
      html = `<h1>Home</h1>
        <a href="view" ${clickLink}>View</a><br>
        <a href="edit" data-transition="slide-up" ${clickLink}>Edit</a><br>
        <a href="view" data-transition="zoom-in"  ${clickLink}>Zoom</a><br>
        <a href="view" data-transition="fade-in"  ${clickLink}}>Fade</a>`;
      break;
    case 'edit':
      html = `<h1><button ${clickBack}>Back</button> Edit</h1><p>Edit ${state.id}</p>`;
      break;
    case 'view':
      html= `<h1><button ${clickBack}>Back</button> ${state.id}</h1>
        <p>View ${state.id}</p>
        <a ${clickLink} href="view-details">Details</a>`;
      break;
    case 'view-details':
      html = `<h1><button ${clickBack}">Back</button>Details</button></h1>`;
      break;
  }
  const div = document.createElement('div');
  div.setAttribute('style', `background:white; 
      height:100%;
      width:100%;
      position:absolute;
      padding:1rem`);
  div.innerHTML = html;

  return {element:div, getState:function(){return state}};
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
window.clickLink = click;

function back() {
  if(navigator.previous)
    navigator.back().then(()=>console.log('Back Done'))
  else
    navigator.set('home',{}).then(()=>console.log('Back-Set Done'))
}
window.clickBack = back;

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