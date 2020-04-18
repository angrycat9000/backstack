import {fixture, expect } from '@open-wc/testing';
import {ScreenTransition} from '../src/backstack';

describe('Events',()=>{
  describe('screen (deprecated)', ()=>{

    it('on set', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      let fired = false;
      nav.addEventListener('screen',(e)=>{
        fired = true;
        expect(e.detail.from, 'detail.from').to.be.null;
        expect(e.detail.to.id, 'detail.to').to.be.equal('test');
      })

      await nav.set('test');
      expect(fired).to.be.true;
    })

    it('on push', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      await nav.set('test');

      let fired = false;
      nav.addEventListener('screen',(e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('push');
      })

      await nav.set('push');
      expect(fired).to.be.true;
    })

    it('on push with transition', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      await nav.set('test');

      let fired = false;
      nav.addEventListener('screen',(e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('push');
      })

      await nav.set('push',null, {transition:ScreenTransition.Fade});
      expect(fired).to.be.true;
    })


    it('on back', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      let fired = false;

      await nav.set('test');
      await nav.push('push');

      nav.addEventListener('screen',(e)=>{
        fired = true;
        expect(e.detail.to.id).to.be.equal('test')
        expect(e.detail.from.id).to.be.equal('push');
      })

      await nav.back();
      expect(fired).to.be.true;
    })

    it('on replace', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      let fired = false;

      await nav.set('test');

      nav.addEventListener('screen',(e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('newscreen');
      })

      await nav.replace('newscreen');
      expect(fired).to.be.true;
    })
  })
})
