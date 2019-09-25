import {fixture, expect } from '@open-wc/testing';
import {ScreenTransition} from '../src/webapp-navigation';

describe('State', () => {  
  it('empty', async ()=> {
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    const state = nav.getState();
    expect(state).to.eql([]);
  });
  it('one item', async()=>{
    const nav = (await fixture('<wam-navigator></wam-navigator>'));
    await nav.push('item1', {data:1});
    const state = nav.getState();
    expect(state.length).to.equal(1);
    expect(state[0]).to.eql({
      id:'item1',
      state:{data:1},
      keepAlive:false,
      transition: ScreenTransition.None
    })
  })
});