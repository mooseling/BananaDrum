import {assert} from 'chai';
import {getUniqueTiming} from '../lib/getUniqueTiming';

describe('Test lib', function() {
  it('getUniqueTiming creates sequential timings', () => {
    assert(getUniqueTiming() === '1');
    assert(getUniqueTiming() === '1.2');
    assert(getUniqueTiming() === '1.3');
    assert(getUniqueTiming() === '1.4');
    assert(getUniqueTiming() === '2');
    assert(getUniqueTiming() === '2.2');
    assert(getUniqueTiming() === '2.3');
    assert(getUniqueTiming() === '2.4');
    assert(getUniqueTiming() === '3');
    assert(getUniqueTiming() === '3.2');
    assert(getUniqueTiming() === '3.3');
    assert(getUniqueTiming() === '3.4');
    assert(getUniqueTiming() === '4');
  });
});
