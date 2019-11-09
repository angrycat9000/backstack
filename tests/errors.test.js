import {fixture, expect } from '@open-wc/testing';

describe('Errors',()=>{
  it('getViewportScroll with nonexistent viewport', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    expect(()=>{nav.getViewportScroll(5)}).to.throw();
  })

  it('set invalid state', async()=>{
    const state = {stack:5};
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    expect(()=>{nav.setState(state)}).to.throw();
  })

  it('set null state', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    expect(()=>{nav.setState()}).to.throw();
  })

  it('set state with empty stack', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    const state = {stack:[], transition:''};
    expect( ()=>{nav.setState(state)} ).to.not.throw();
  })

  it('bad screen factory return', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    nav.screenFactory = function(id, state, container) {
      return 5;
    };

    var rejected = false;
    await nav.push('id',{data:6}).catch(()=>{
      rejected = true;
    })

    expect(rejected).to.be.true;
  })

  it('no screen factory return', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    nav.screenFactory = function(id, state, container) {
      return;
    };

    var rejected = false;
    await nav.push('id',{data:6}).catch(()=>{
      rejected = true;
    })

    expect(rejected).to.be.true;
  })
});