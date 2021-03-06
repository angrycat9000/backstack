import {fixture, expect } from '@open-wc/testing';
import {Action} from '../src/backstack';

describe('Events',()=>{
  describe('before-change', () => {
    it('on set', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      let fired = false;

      nav.addEventListener('before-change',(e)=>{
        fired = true;
        expect(e.detail.from).to.be.null;
        expect(e.detail.to.id).to.be.equal('test');
        expect(e.detail.action).to.be.equal(Action.Set);
        e.preventDefault();
      });

      const aborted = await nav.set('test').then(()=>{return false}, ()=>{return true});

      expect(fired, 'Fired').to.be.true;
      expect(aborted,'Aborted').to.be.true;
    })
    it('on push', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));
      await nav.set('test');

      let fired = false;

      nav.addEventListener('before-change',(e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('push');
        expect(e.detail.action).to.be.equal(Action.Push);
        e.preventDefault();
      })

      const aborted = await nav.push('push').then(()=>{return false}, ()=>{return true});

      expect(fired, 'Fired').to.be.true;
      expect(aborted,'Aborted').to.be.true;
    })

   it('on back', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));

      let fired = false;

      await nav.set('test');
      await nav.push('push');

      nav.addEventListener('before-change',(e)=>{
        fired = true;
        expect(e.detail.to.id).to.be.equal('test')
        expect(e.detail.from.id).to.be.equal('push');
        expect(e.detail.action).to.be.equal(Action.Back);
        e.preventDefault();
      })

      const aborted = await nav.back().then(()=>{return false}, ()=>{return true});

      expect(fired, 'Fired').to.be.true;
      expect(aborted,'Aborted').to.be.true;
    })

    it('on replace', async()=>{
      const nav = (await fixture('<backstack-manager></backstack-manager>'));

      let fired = false;

      await nav.set('test');

      nav.addEventListener('before-change', (e)=>{
        fired = true;
        expect(e.detail.from.id).to.be.equal('test')
        expect(e.detail.to.id).to.be.equal('newscreen');
        expect(e.detail.action).to.be.equal(Action.Replace);
        e.preventDefault();
      })

      const aborted = await nav.replace('newscreen').then(()=>{return false}, ()=>{return true});

      expect(fired, 'Fired').to.be.true;
      expect(aborted,'Aborted').to.be.true;
    })
  })
})
