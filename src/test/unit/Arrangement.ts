import {assert} from 'chai';
import {createTestEcosystem} from '../lib/createTestEcosystem';
import {Arrangement} from '../../prod/Arrangement';


describe('Track', function() {
  let library: Library|undefined;

  before('Load library', () => createTestEcosystem().then(eco => library = eco.library));

  describe('Default arrangement', function() {
    const arrangement = Arrangement(library);

    it('is 4/4, 120bpm, 1 bar', () => {
      assert(arrangement.timeSignature === '4/4');
      assert(arrangement.tempo === 120);
      assert(arrangement.length === 1);
    });

    it('says it has 16 sixteenths', () => {
      assert(arrangement.getSixteenthCount() === 16);
    });
  });
});
