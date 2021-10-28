import {assert} from 'chai';
import {getUniqueTiming} from '../lib/getUniqueTiming';

describe('Test lib', function() {
  it('getUniqueTiming creates sequential timings', () => {
    assert(getUniqueTiming() === '1.1.1');
    assert(getUniqueTiming() === '1.2.1');
    assert(getUniqueTiming() === '1.3.1');
    assert(getUniqueTiming() === '1.4.1');
    assert(getUniqueTiming() === '2.1.1');
    assert(getUniqueTiming() === '2.2.1');
    assert(getUniqueTiming() === '2.3.1');
    assert(getUniqueTiming() === '2.4.1');
    assert(getUniqueTiming() === '3.1.1');
    assert(getUniqueTiming() === '3.2.1');
    assert(getUniqueTiming() === '3.3.1');
    assert(getUniqueTiming() === '3.4.1');
    assert(getUniqueTiming() === '4.1.1');
  });
});
