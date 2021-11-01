import {assert} from 'chai';
import {createTestEcosystem} from '../lib/createTestEcosystem';
import {Arrangement} from '../../prod/Arrangement';


describe('Arrangement', function() {
  let library: Library|undefined;

  before('Load library', () => createTestEcosystem().then(eco => library = eco.library));

  describe('Default arrangement', function() {
    const arrangement = Arrangement(library);

    it('is 4/4, 120bpm, 1 bar', () => {
      assert(arrangement.timeParams.timeSignature === '4/4');
      assert(arrangement.timeParams.tempo === 120);
      assert(arrangement.timeParams.length === 1);
    });

    it('gives back the right set of sixteenths', () => assert(checkSixteenths(arrangement.getSixteenths())));
  });
});

function checkSixteenths(sixteenths:Timing[]): boolean {
  const expected = [
    '1.1.1', '1.1.2', '1.1.3', '1.1.4',
    '1.2.1', '1.2.2', '1.2.3', '1.2.4',
    '1.3.1', '1.3.2', '1.3.3', '1.3.4',
    '1.4.1', '1.4.2', '1.4.3', '1.4.4',
  ];
  return sixteenths.every((value, index) => value === expected[index]);
}
