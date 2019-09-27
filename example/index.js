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
      customTitle: '',
      customTransition: ''
    };
    navigator.push(id, state, {transition:transition})
  }  else {
    const myState = navigator.current.getState();
    const nextState = {
      title: myState.customTitle || '(none provided)',
      transition: myState.customTransition || '',
      customTitle:'',
      customTransition:''
    };
    navigator.push('nested', nextState, {transition:myState.customTransition})
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

function setTemplateInput(instance, binding, prop, value) {
  const el = instance.querySelector(`[data-binding=${binding}]`);
  if(el && value)
    el.value = value;

  return el;
}

function createScreenFromTemplate(id, state) {
  const template = document.getElementById(id);
  const instance = document.importNode(template.content, true);
  const standard = document.getElementById('standard-nav');

  setTemplateString(instance, 'title', state.title);
  setTemplateString(instance, 'transition', state.transition);
  const customTitleBound = setTemplateInput(instance, 'customTitle', state.customTitle);
  setTemplateChild(instance, 'standardNav', document.importNode(standard.content, true));
  const customTransitionBound = setTemplateInput(instance, 'customTransition', 'selectedValue', )

  return {
    element:instance,
    getState:function() {
      return {
        title: state.title,
        transition: state.transition,
        customTitle: customTitleBound ? customTitleBound.value : '',
        customTransition: customTransitionBound ? customTransitionBound.value : ''
      }
    }
  }
}

var navigator;
function run() {
  document.addEventListener('click', click);

  navigator = document.createElement('wam-navigator');
  navigator.screenFactory = createScreenFromTemplate;
  window.wamNavigator = navigator;
  document.body.appendChild(navigator);

  navigator.set('home',{}).then(()=>console.log('Init'))  
}

if('loading' == document.readyState) {
  window.addEventListener('DOMContentLoaded', run);
} else {
  run();
}