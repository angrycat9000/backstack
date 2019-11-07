import {ScreenTransition} from '../src/backstack'

function click(event) {
  let element = event.target;
  while(element && element.tagName != 'BUTTON') {
    element = element.parentElement;
  }
  if( ! element)
    return;

  if(element.hasAttribute('data-back')) {
    navigator.back();
  }  else {
    const transition = element.getAttribute('data-transition');
    const myState = navigator.current.getState();
    const nextState = {
      title: myState.nextTitle || '(untitled)',
      nextTitle:''
    };
    navigator.push('nested', nextState, {transition})
  }

  event.preventDefault();
}




function setTemplateString(instance, binding, value) {
  return setTemplateChild(instance, binding, document.createTextNode(value || ''));
}

function setTemplateChild(instance, binding, value) {
  const el = instance.querySelector(`[data-binding=${binding}]`);
  if(el && value)
    el.appendChild(value);

  return el;
}

function setTemplateInput(instance, binding, value) {
  const el = instance.querySelector(`[data-binding=${binding}]`);
  if(el && value)
    el.value = value;

  return el;
}

function createScreenFromTemplate(id, state, container) {
  const template = document.getElementById(id);
  const instance = document.importNode(template.content, true);
  const standard = document.getElementById('standard-nav');

  setTemplateString(instance, 'title', state.title);
  const nextTitleBound = setTemplateInput(instance, 'nextTitle', state.nextTitle);
  setTemplateChild(instance, 'standardNav', document.importNode(standard.content, true));
  setTemplateString(instance, 'state', JSON.stringify(navigator.getState(), null, 1) );

  container.appendChild(instance);

  return {
    getState:function() {
      return {
        title: state.title,
        nextTitle: nextTitleBound ? nextTitleBound.value : 'Second Screen',
      }
    }
  }
}

var navigator;
function run() {
  document.addEventListener('click', click);

  const p = document.getElementById('standard-nav').content.firstElementChild;
  for(let t in ScreenTransition) {
     const val = ScreenTransition[t];
     p.innerHTML += `<button data-transition="${val}">${t}</button> `;
  }

  navigator = document.getElementById('screen');
  navigator.screenFactory = createScreenFromTemplate;
  window.wamNavigator = navigator;

  navigator.set('home',{}).then(()=>console.log('Init'))  
}

if('loading' == document.readyState) {
  window.addEventListener('DOMContentLoaded', run);
} else {
  run();
}