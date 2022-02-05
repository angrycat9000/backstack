import {fixture, expect } from '@open-wc/testing';
import '../src/backstack';

describe('Errors',()=>{
  it('getViewportScroll with nonexistent viewport throws', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    expect(()=>{nav.getViewportScroll(5)}).to.throw();
  })

  it('set invalid state throws', async()=>{
    const state = {stack:5};
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    // throws before the promise chain return value so no need to await the result
    expect(()=>{nav.setState(state)}).to.throw();
  })

  it('set null state throws', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    // throws before the promise chain return value so no need to await the result
    expect(()=>{nav.setState()}).to.throw();
  })

  it('set state with empty stack does not reject', async()=>{
    const nav = (await fixture('<backstack-manager></backstack-manager>'));
    const state = {stack:[], transition:''};
    let rejected = false;
    // need to validate the promise return value
    await nav.setState(state).catch(() => {rejected = true});
    expect(rejected).to.be.false;
  })

  it('bad screen factory return rejects', async()=>{
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

  it('no screen factory return rejects', async()=>{
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