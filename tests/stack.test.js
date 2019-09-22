import { html, fixture, expect } from '@open-wc/testing';
import {Navigator, ScreenTransition} from '../src/webapp-navigation';

describe('Stack', () => {  
  it('init empty', async ()=> {
    //const nav = (await fixture('<wam-navigator></wam-navigator>'));
    
    const nav = new Navigator();
    expect(nav._stack.length).to.equal(0);
    expect(nav.previous).to.be.null;
    expect(nav.current).to.be.null;
  });
  it('push defaults', async ()=> {
    const testId = 'testid01234'
    const nav = Navigator.create();
    //const nav = (await fixture('<wam-navigator></wam-navigator>'));
    await nav.push(testId, {data:1},);
    //expect(nav.current.id).to.equal('testid');
    const item = nav.current;
    expect(item.id).to.equal(testId)
    expect(item.transition).to.equal(ScreenTransition.None);
    expect(item.keepAlive).to.be.false;
    expect(nav.current.isOverlay).to.be.false;
  });
  it('set', async()=>{
    const nav = Navigator.create();
    await nav.set('itemxyz', null);
    expect(nav.current.id).to.equal('itemxyz');
  });
  it('set with stack', async()=>{
    const nav = Navigator.create();

    await nav.push('item1',null)
    .then(()=>nav.push('item2',null))
    .then(()=>nav.set('itemxyz', null))

    expect(nav._stack.length).to.equal(1);
    expect(nav.current.id).to.equal('itemxyz');
    
  })
  it('back', async()=>{
    const nav = Navigator.create();

    await nav.push('item1', null)
      .then(()=>{
        return nav.push('item2', null);
      });
    
    expect(nav._stack.length).to.equal(2);
    expect(nav.current.id).to.equal('item2');
    nav.back();
    const item = nav.current;
    expect(item.id).to.equal('item1');
  })
  it('replace with stack=0', async()=>{
    const nav = Navigator.create();
    await nav.replace('item1', null);
    expect(nav.current.id).to.equal('item1');
  })
  it('replace with stack=1', async()=>{
    const nav = Navigator.create();
    await nav.push('item1', null)
      .then(()=>{
        return nav.replace('item2', null);
      });
    
    expect(nav._stack.length).to.equal(1);
    expect(nav.current.id).to.equal('item2');
    expect(nav.previous).to.be.null;
  });

  it('replace with stack=2', async()=>{
    const nav = Navigator.create();

    await nav.push('item1', null)
      .then(()=>nav.push('item2', null))
      .then(()=>nav.replace('item3', null));
    
    expect(nav._stack.length).to.equal(2);
    expect(nav.current.id).to.equal('item3');
    expect(nav.previous).to.not.be.null;
  })

  it('reject on back with empty stack', async()=>{
    const nav = Navigator.create();
    var rejected = false;
    await nav.back().catch(()=>{
      rejected = true;
    })
    expect(rejected).to.be.true;
  })
});