import {assert} from 'chai';
import {TimeCoordinator} from '../../prod/TimeCoordinator';
import {TimeParams} from '../../prod/TimeParams';

type TestCase = [Timing, number];

describe('TimeCoordinator', function() {
  describe('4/4 time, 120bpm', function() {
    const timeParams:TimeParams = TimeParams({timeSignature:'4/4', tempo:120, length:1});
    const timeCoordinator = TimeCoordinator(timeParams);

    it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime('1.1.1') === 0));

    const testCases:TestCase[] = [
      ['3.3.1', 5],
      ['3.3.1', 5],
      ['13.3.1', 25],
      ['13.3.1', 25],
      ['17.1.1', 32],
      ['17.1.1.1', 32],
      ['17.2.1', 32.5],
      ['19.2.4', 36.875]
    ];
    it('passes a bunch of test cases', () => {
      testCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });

    const tripletTestCases:TestCase[] = [
      ['1.2T.1', 2/3], // 2 seconds per bar at 120bpm
      ['1.3TT.1', 4/3],
      ['1.1T.1', 1/6],
      ['4.2T.1', 6 + 2/3],
      ['7.3TT.1', 12 + 4/3],
      ['2.1T.1', 2 + 1/6]
    ];
    it('...and a bunch of test cases with triplets', () => {
      tripletTestCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });
  });

  describe('6/8 time, 140bpm', function() {
    const timeParams:TimeParams = TimeParams({timeSignature:'6/8', tempo:140, length:1});
    const timeCoordinator = TimeCoordinator(timeParams);

    it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime('1.1.1') === 0));

    const testCases:TestCase[] = [
      ['3.3.1', 3],
      ['3.3.1', 3],
      ['3.3.1.1', 3],
      ['47.5.1', 60],
      ['47.5.1', 60],
      ['8.1.1', 9]
    ];
    it('Passes a bunch of test cases', () => {
      testCases.forEach(([timing, expectedRealTime]) => {
        const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
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
        const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
        const difference = Math.abs(expectedRealTime - calculatedRealTime);
        if (difference > 0.00000001)
          throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
      });
    });
  });
});
