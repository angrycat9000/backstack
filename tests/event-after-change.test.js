import {fixture, expect } from '@open-wc/testing';
import {Action} from '../src/backstack';

describe('Events',()=>{
  describe('after-change', () => {
    it('on set', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      let fired = false;

      nav.addEventListener('after-change',(e)=>{
        fired = true;
        expect(e.detail.from).to.be.null;
        expect(e.detail.to.id).to.be.equal('test');
        expect(e.detail.action).to.be.equal(Action.Set);
      });

      await nav.set('test');

      expect(fired, 'Fired').to.be.true;
    })
    it('on push', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      await nav.set('test');

      let fired = false;

      nav.addEventListener('after-change',(e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('push');
        expect(e.detail.action).to.be.equal(Action.Push);
      })

      await nav.push('push')

      expect(fired, 'Fired').to.be.true;
    })

   it('on back', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));

      let fired = false;

      await nav.set('test');
      await nav.push('push');

      nav.addEventListener('after-change',(e)=>{
        fired = true;
        expect(e.detail.to.id).to.be.equal('test')
        expect(e.detail.from.id).to.be.equal('push');
        expect(e.detail.action).to.be.equal(Action.Back);
      })

      await nav.back();

      expect(fired, 'Fired').to.be.true;
    })

    it('on replace', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));

      let fired = false;

      await nav.set('test');

      nav.addEventListener('after-change', (e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('newscreen');
        expect(e.detail.action).to.be.equal(Action.Replace);
        e.preventDefault();
      })

      await nav.replace('newscreen');

      expect(fired, 'Fired').to.be.true;
    })
  })
})
