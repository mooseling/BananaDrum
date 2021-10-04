import {assert} from 'chai';
import {TimeConverter} from '../../dist/TimeConverter.js';

describe('TimeConverter', function() {
  describe('4/4 time, 120bpm', function() {
    const basicTimeConverter = TimeConverter('4/4', 120);

    it('returns 0 on the 1', () => assert(basicTimeConverter.convertToRealTime('1') === 0));

    const testCases = [
      ['3.3.1', 5],
      ['3.3', 5],
      ['13.3.1', 25],
      ['13.3', 25],
      ['17', 32],
      ['17.1.1.1.1.1', 32],
      ['17.2', 32.5],
      ['19.2.4', 36.875],
      ['19.2.4', 36.875]
    ];
    it('Passes a bunch of test cases', () => {
      testCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = basicTimeConverter.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });
  });

  describe('6/8 time, 140bpm', function() {
    const basicTimeConverter = TimeConverter('6/8', 140);

    it('returns 0 on the 1', () => assert(basicTimeConverter.convertToRealTime('1') === 0));

    const testCases = [
      ['3.3.1', 3],
      ['3.3', 3],
      ['3.3.1.1.1.1', 3],
      ['47.5.1', 60],
      ['47.5', 60]
    ];
    it('Passes a bunch of test cases', () => {
      testCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = basicTimeConverter.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });
  });
});
