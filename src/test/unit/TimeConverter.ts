import {assert} from 'chai';
import {TimeConverter} from '../../prod/TimeConverter';

type TestCase = [string, number];

describe('TimeConverter', function() {
  describe('4/4 time, 120bpm', function() {
    const params:ArrangementDetails = {timeSignature:'4/4', tempo:120, length:1};
    const basicTimeConverter = TimeConverter(params);

    it('returns 0 on the 1', () => assert(basicTimeConverter.convertToRealTime('1') === 0));

    const testCases:TestCase[] = [
      ['3.3.1', 5],
      ['3.3', 5],
      ['13.3.1', 25],
      ['13.3', 25],
      ['17', 32],
      ['17.1.1.1.1.1', 32],
      ['17.2', 32.5],
      ['19.2.4', 36.875]
    ];
    it('passes a bunch of test cases', () => {
      testCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = basicTimeConverter.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });

    const tripletTestCases:TestCase[] = [
      ['1.2T', 2/3], // 2 seconds per bar at 120bpm
      ['1.3TT', 4/3],
      ['1.1T', 1/6],
      ['4.2T', 6 + 2/3],
      ['7.3TT', 12 + 4/3],
      ['2.1T', 2 + 1/6]
    ];
    it('...and a bunch of test cases with triplets', () => {
      tripletTestCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = basicTimeConverter.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });
  });

  describe('6/8 time, 140bpm', function() {
    const params:ArrangementDetails = {timeSignature:'6/8', tempo:140, length:1};
    const basicTimeConverter = TimeConverter(params);

    it('returns 0 on the 1', () => assert(basicTimeConverter.convertToRealTime('1') === 0));

    const testCases:TestCase[] = [
      ['3.3.1', 3],
      ['3.3', 3],
      ['3.3.1.1.1.1', 3],
      ['47.5.1', 60],
      ['47.5', 60],
      ['8', 9]
    ];
    it('Passes a bunch of test cases', () => {
      testCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = basicTimeConverter.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });

    const tripletTestCases:TestCase[] = [
      ['1.5.2T', 1],
      ['2.4.1TT', 2],
      ['8.5.2T', 10],
      ['9.4.1TT', 11]
    ];
    it('...and a bunch of test cases with triplets', () => {
      tripletTestCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = basicTimeConverter.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });
  });
});
