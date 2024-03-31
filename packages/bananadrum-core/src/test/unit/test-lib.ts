import { assert } from 'chai';
import { getUniqueTiming } from '../lib/getUniqueTiming.js';

describe('Test lib', function() {
  it('getUniqueTiming creates sequential timings', () => {
    compareTimings(getUniqueTiming(), {bar:1, step:1});
    compareTimings(getUniqueTiming(), {bar:1, step:2});
    compareTimings(getUniqueTiming(), {bar:1, step:3});
    compareTimings(getUniqueTiming(), {bar:1, step:4});
    compareTimings(getUniqueTiming(), {bar:1, step:5});
    compareTimings(getUniqueTiming(), {bar:1, step:6});
    compareTimings(getUniqueTiming(), {bar:1, step:7});
    compareTimings(getUniqueTiming(), {bar:1, step:8});
    compareTimings(getUniqueTiming(), {bar:1, step:9});
    compareTimings(getUniqueTiming(), {bar:1, step:10});
    compareTimings(getUniqueTiming(), {bar:1, step:11});
    compareTimings(getUniqueTiming(), {bar:1, step:12});
    compareTimings(getUniqueTiming(), {bar:1, step:13});
    compareTimings(getUniqueTiming(), {bar:1, step:14});
    compareTimings(getUniqueTiming(), {bar:1, step:15});
    compareTimings(getUniqueTiming(), {bar:1, step:16});
    compareTimings(getUniqueTiming(), {bar:2, step:1});
    compareTimings(getUniqueTiming(), {bar:2, step:2});
    compareTimings(getUniqueTiming(), {bar:2, step:3});
    compareTimings(getUniqueTiming(), {bar:2, step:4});
    compareTimings(getUniqueTiming(), {bar:2, step:5});
    compareTimings(getUniqueTiming(), {bar:2, step:6});
    compareTimings(getUniqueTiming(), {bar:2, step:7});
    compareTimings(getUniqueTiming(), {bar:2, step:8});
    compareTimings(getUniqueTiming(), {bar:2, step:9});
    compareTimings(getUniqueTiming(), {bar:2, step:10});
    compareTimings(getUniqueTiming(), {bar:2, step:11});
    compareTimings(getUniqueTiming(), {bar:2, step:12});
    compareTimings(getUniqueTiming(), {bar:2, step:13});
    compareTimings(getUniqueTiming(), {bar:2, step:14});
    compareTimings(getUniqueTiming(), {bar:2, step:15});
    compareTimings(getUniqueTiming(), {bar:2, step:16});
    compareTimings(getUniqueTiming(), {bar:3, step:1});
    compareTimings(getUniqueTiming(), {bar:3, step:2});
    compareTimings(getUniqueTiming(), {bar:3, step:3});
    compareTimings(getUniqueTiming(), {bar:3, step:4});
    compareTimings(getUniqueTiming(), {bar:3, step:5});
    compareTimings(getUniqueTiming(), {bar:3, step:6});
    compareTimings(getUniqueTiming(), {bar:3, step:7});
    compareTimings(getUniqueTiming(), {bar:3, step:8});
    compareTimings(getUniqueTiming(), {bar:3, step:9});
    compareTimings(getUniqueTiming(), {bar:3, step:10});
    compareTimings(getUniqueTiming(), {bar:3, step:11});
    compareTimings(getUniqueTiming(), {bar:3, step:12});
    compareTimings(getUniqueTiming(), {bar:3, step:13});
    compareTimings(getUniqueTiming(), {bar:3, step:14});
    compareTimings(getUniqueTiming(), {bar:3, step:15});
    compareTimings(getUniqueTiming(), {bar:3, step:16});
  });
});


function compareTimings(timing1, timing2) {
  assert(timing1.bar === timing2.bar);
  assert(timing1.step === timing2.step);
}
