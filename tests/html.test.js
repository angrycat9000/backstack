import {fixture, expect } from '@open-wc/testing';
import {ScreenTransition} from '../src/backstack';


function screenFactory(id, state, container) {
  container.innerHTML = id;
  return {getState:function(){return state}}
}

describe('DOM', () => {  
  it('init', async ()=> {
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name=""></slot></div>')
    expect(nav).lightDom.to.equal('');
  });

  it('set none', async ()=> {
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    nav.screenFactory = screenFactory
    await nav.set('mine', {data:7});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>',  { ignoreAttributes: ['style'] })
  });

  it('set with 2', async ()=> {
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    nav.screenFactory = screenFactory
    await nav.push('x1', {data:4}, {transition:ScreenTransition.SlideLeft});
    await nav.push('x2', {data:5}, {transition:ScreenTransition.SlideLeft});
    await nav.set('mine', {data:7});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>',  { ignoreAttributes: ['style'] })
    expect(nav._stack.length).to.equal(1);
  });
  describe('Push', ()=>{ 

    it('push from empty', async ()=> {
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.push('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="1">mine</div>',  { ignoreAttributes: ['style'] })
    });

    it('from 1', async ()=> {
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory;
      await nav.set('test', {data:6}, {transition:ScreenTransition.SlideLeft});
      await nav.push('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="2"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="2">mine</div>', { ignoreAttributes: ['style'] })
      expect(nav._stack.length).to.equal(2);
    });

    it('overlay', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.transition = ScreenTransition.None;
      nav.screenFactory = screenFactory;
      await nav.set('One', {data:1});
      await nav.push('Overlay', {data:2}, {isOverlay:true});
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="1">One</div><div slot="1">Overlay</div>',  { ignoreAttributes: ['style'] }); 
    })
  })
  describe('Replace', ()=>{
    it('from empty', async ()=> {
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.replace('mine', {data:7});
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="1">mine</div>',  { ignoreAttributes: ['style'] })
    });

    it('with 1', async ()=> {
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.set('old screen', {data:6}, {transition:ScreenTransition.SlideLeft});
      await nav.replace('new screen', {data:7}, {transition:ScreenTransition.SlideLeft});
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="1">new screen</div>',  { ignoreAttributes: ['style'] })
      expect(nav._stack.length).to.equal(1);
    });
  })
  describe('Back', ()=>{
    it('from 2 -> 1', async ()=> {
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.push('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
      await nav.push('test', {data:6}, {transition:ScreenTransition.SlideLeft});
      await nav.back();
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="1">mine</div>',  { ignoreAttributes: ['style'] })
      expect(nav._stack.length).to.equal(1);
    });
  
    it('without transition', async ()=> {
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.push('mine', {data:7}, {transition:ScreenTransition.None});
      await nav.push('test', {data:6}, {transition:ScreenTransition.None});
      await nav.back();
      expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
      expect(nav).lightDom.to.equal('<div slot="1">mine</div>',  { ignoreAttributes: ['style'] })
      expect(nav._stack.length).to.equal(1);
    });
    it('from overlay', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.set('bottom', {data:6});
      await nav.push('overlay', {data:7}, {isOverlay:true, transition:ScreenTransition.SlideLeft});
      await nav.back();
      expect(nav).lightDom.to.equal(`<div slot="1">bottom</div>`,  { ignoreAttributes: ['style'] })
    })
    it('to overlay', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.set('bottom', {data:6});
      await nav.push('overlay', {data:7}, {isOverlay:true});
      await nav.push('bottom', {data:8}, {transition:ScreenTransition.SlideLeft});
      await nav.back();
      expect(nav).lightDom.to.equal(`<div slot="1">bottom</div><div slot="1">overlay</div>`,  { ignoreAttributes: ['style'] })
    })
  })
  

  it('hydrate twice returns same element', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    const item = (await nav.push('item1', {data:1})).to
    const element = nav.firstElementChild;
    const element2 = item.hydrate(nav);
    expect(element).to.be.equal(element2);
    expect(nav.children.length).to.be.equal(1);
  });

  it('dehydrate calls disconnect', async()=>{
    var disconnected = false;
    const myScreenFactory = function(a,b,c) {
      const r = screenFactory(a,b,c);
      r.disconnect = function(){disconnected = true}
      return r;
    };

    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    nav.screenFactory = myScreenFactory;
    await nav.push('item1', {data:1});
    await nav.push('item2', {data:1});
    await nav.back();

    expect(disconnected).to.be.true;
  })

  it('jsonScreenFactory', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    await nav.set('id', {key:'value'});
    expect(nav).lightDom.to.equal(`<div slot="1">
      <h1>State for 'id'</h1>
      <pre>{"key":"value"}</pre>
      </div>`,  { ignoreAttributes: ['style'] })
  })

  describe('Overlay', ()=>{
    it('overlay screen keeps previous', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.set('bottom', {data:6});
      await nav.push('new screen', {data:7}, {isOverlay:true, transition:ScreenTransition.SlideLeft});
      expect(nav).lightDom.to.equal(`<div slot="1">bottom</div><div slot="1">new screen</div>`,  { ignoreAttributes: ['style'] })
    })
    it('new screen clears viewport', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      nav.screenFactory = screenFactory
      await nav.set('bottom', {data:6});
      await nav.push('overlay', {data:7}, {isOverlay:true});
      await nav.push('new', {data:7}, {transition:ScreenTransition.SlideLeft});
      expect(nav).lightDom.to.equal(`<div slot="2">new</div>`,  { ignoreAttributes: ['style'] })
    })
  })
})