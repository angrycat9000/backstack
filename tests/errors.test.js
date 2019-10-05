import {fixture, expect } from '@open-wc/testing';

describe('Errors',()=>{
  it('getViewportScroll with nonexistent viewport', async()=>{
    const nav = (await fixture('<wam-screenstack></wam-screenstack>'));
    expect(()=>{nav.getViewportScroll(5)}).to.throw();
  })

  it('set invalid state', async()=>{
    const state = {stack:5};
    const nav = (await fixture('<wam-screenstack></wam-screenstack>'));
    expect(()=>{nav.setState(state)}).to.throw();
  })

  it('set null state', async()=>{
    const nav = (await fixture('<wam-screenstack></wam-screenstack>'));
    expect(()=>{nav.setState()}).to.throw();
  })

  it('bad screen factory return', async()=>{
    const nav = (await fixture('<wam-screenstack></wam-screenstack>'));
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
    const nav = (await fixture('<wam-screenstack></wam-screenstack>'));
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