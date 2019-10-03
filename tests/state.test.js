import {fixture, expect } from '@open-wc/testing';
import {ScreenTransition} from '../src/webapp-navigation';

function getDummyState() {
  return {
    transition: 'slide-up',
    stack: [
      {
        id:'item1', 
        state:{data:1}, 
        transition: 'slide-left', 
        viewportScroll: {x:5, y:5}
      },
      {
        id:'item2',
        state:{data:1}, 
        transition: 'slide-down', 
        viewportScroll: {x:10, y:10}
      }
    ]
  };
}

describe('State', () => {  
  it('empty', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    const state = nav.getState();
    expect(state).to.eql({
      stack:[],
      transition: ScreenTransition.None
    });
  });
  it('one item', async()=>{
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    await nav.push('item1', {data:1});
    const state = nav.getState();
    expect(state.stack.length).to.equal(1);
    expect(state.stack[0]).to.eql({
      id:'item1',
      state:{data:1},
      transition: ScreenTransition.None,
      viewportScroll: {x:0, y:0}
    })
  }) 

  it('set state', async()=>{
    const state = getDummyState();
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    nav.setState(state);
    await nav.updateComplete;
    expect(nav.getState()).to.eql(state);
    expect(nav.transition).to.equal('slide-up');

    expect(nav).lightDom.to.equal('<div slot="2"></div>')
  })

  it('set state with previous state', async()=>{
    const state = getDummyState();

    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    await nav.push('mine', {data:1});
    nav.setState(state);
    await nav.updateComplete;
    expect(nav.getState()).to.eql(state);
    expect(nav.transition).to.equal('slide-up');
    expect(nav).lightDom.to.equal('<div slot="2"></div>')
  })
});