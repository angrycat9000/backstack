import { ScreenTransition } from '../src/webapp-navigation';


function click(event) {
  let element = event.target;
  while(element && element.tagName != 'A' && element.tagName != 'BUTTON') {
    element = element.parentElement;
  }
  if( ! element)
    return;

  if(element.hasAttribute('data-back')) {
    navigator.back();
  } else if('A' == element.tagName) {
    const transition = element.getAttribute('data-transition');
    const id = element.getAttribute('href');
    const state =  {
      title:element.innerHTML, 
      transition:transition,
      nextTitle: '',
      nextTransition: ''
    };
    navigator.push(id, state, {transition:transition})
  }  else {
    const myState = navigator.current.getState();
    const nextState = {
      title: myState.nextTitle || '(none provided)',
      transition: myState.nextTransition || '',
      nextTitle:'',
      nextTransition:''
    };
    navigator.push('nested', nextState, {transition:myState.nextTransition})
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
  setTemplateString(instance, 'transition', state.transition);
  const nextTitleBound = setTemplateInput(instance, 'nextTitle', state.nextitle);
  const nextTransitionBound = setTemplateInput(instance, 'nextTransition', state.nextTransition)
  setTemplateChild(instance, 'standardNav', document.importNode(standard.content, true));
  setTemplateString(instance, 'state', JSON.stringify(navigator.getState(), null, 1) );

  container.appendChild(instance);

  //if(state.scroll)
  //  container.scrollTop = state.scroll;

  return {
    getState:function() {
      return {
        title: state.title,
        transition: state.transition,
        nextTitle: nextTitleBound ? nextTitleBound.value : '',
        nextTransition: nextTransitionBound ? nextTransitionBound.value : '',
      }
    }
  }
}

var navigator;
function run() {
  document.addEventListener('click', click);

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