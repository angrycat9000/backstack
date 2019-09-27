import {fixture, expect } from '@open-wc/testing';
import {ScreenTransition} from '../src/webapp-navigation';


function screenFactory(id, state) {
  const div = document.createElement('div');
  div.innerHTML = id;
  return {element:div, getState:function(){return state}}
}

describe('DOM', () => {  
  it('init', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name=""></slot></div>')
    expect(nav).lightDom.to.equal('');
  });

  it('set none', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.set('mine', {data:7});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
  });

  it('set with 2', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.push('x1', {data:4}, {transition:ScreenTransition.SlideLeft});
    await nav.push('x2', {data:5}, {transition:ScreenTransition.SlideLeft});
    await nav.set('mine', {data:7});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
    expect(nav._stack.length).to.equal(1);
  });

  it('push from empty', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.push('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
  });

  it('push from 1', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.set('test', {data:6}, {transition:ScreenTransition.SlideLeft});
    await nav.push('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="2"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="2">mine</div>')
    expect(nav._stack.length).to.equal(2);
  });
  it('replace from empty', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.replace('mine', {data:7});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
  });


  it('replace from 1', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.set('test', {data:6}, {transition:ScreenTransition.SlideLeft});
    await nav.replace('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
    expect(nav._stack.length).to.equal(1);
  });

  it('back from 1', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.push('mine', {data:7}, {transition:ScreenTransition.SlideLeft});
    await nav.push('test', {data:6}, {transition:ScreenTransition.SlideLeft});
    await nav.back();
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
    expect(nav._stack.length).to.equal(1);
  });

  it('back without transition', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.screenFactory = screenFactory
    await nav.push('mine', {data:7}, {transition:ScreenTransition.None});
    await nav.push('test', {data:6}, {transition:ScreenTransition.None});
    await nav.back();
    expect(nav).shadowDom.to.equal('<div id="base" class="screen"><slot name="1"></slot></div>');
    expect(nav).lightDom.to.equal('<div slot="1">mine</div>')
    expect(nav._stack.length).to.equal(1);
  });
})