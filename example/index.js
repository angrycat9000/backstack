import {ScreenTransition} from '../src/backstack';

function click(event) {
  let element = event.target;
  while(element && element.tagName != 'BUTTON') {
    element = element.parentElement;
  }
  if( ! element)
    return;

  if(element.hasAttribute('data-back')) {
    navigator.back();
  } else if (element.hasAttribute('data-reset')) {
    navigator.set('home',{});
  } else if(element.hasAttribute('data-overlay')) {
    navigator.push('overlay', 
      {state:navigator.getState()}, 
      {isOverlay:true, transition:element.getAttribute('data-transition') || ScreenTransition.Fade});
  } else {
    const transition = element.getAttribute('data-transition');
    const myState = navigator.current.getState();
    const nextState = {
      title: myState.nextTitle || '(untitled)',
      nextTitle: `Screen #${navigator._stack.length + 2}`
    };
    if (element.hasAttribute('data-replace'))
      navigator.replace('nested', nextState, {transition});
    else
      navigator.push('nested', nextState, {transition});
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
  setTemplateString(instance, 'state', JSON.stringify(state, null, 1) );

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

function screenId(item) {
  return item ? `"${item.id}"` : 'null';
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
  navigator.addEventListener('screen',(e)=>{
    console.log(`Screen change from ${screenId(e.detail.from)} to ${screenId(e.detail.to)}`);
  })
  window.wamNavigator = navigator;

  navigator.set('home',{}).then(()=>console.log('Init'))  
}

if('loading' == document.readyState) {
  window.addEventListener('DOMContentLoaded', run);
} else {
  run();
}