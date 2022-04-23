import {assert} from 'chai';
import {TimeCoordinator} from '../../prod/TimeCoordinator';
import {TimeParams} from '../../prod/TimeParams';

type TestCase = [Banana.Timing, number];

describe('TimeCoordinator', function() {
  describe('Time conversion', function() {
    describe('4/4 time, 120bpm', function() {
      const timeParams:Banana.TimeParams = TimeParams({timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16});
      const timeCoordinator = TimeCoordinator(timeParams);

      it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:3, step:9}, 5],
        [{bar:13, step:9}, 25],
        [{bar:17, step:1}, 32],
        [{bar:17, step:5}, 32.5],
        [{bar:19, step:8}, 36.875]
      ];
      it('passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedRealTime]) => {
          const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
          const difference = Math.abs(expectedRealTime - calculatedRealTime);
          if (difference > 0.00000001)
            throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
        });
      });

    // describe('6/8 time, 140bpm', function() {
    //   const timeParams:Banana.TimeParams = TimeParams({timeSignature:'6/8', tempo:140, length:1});
    //   const timeCoordinator = TimeCoordinator(timeParams);
    //
    //   it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime('1.1.1') === 0));
    //
    //   const testCases:TestCase[] = [
    //     ['3.3.1', 3],
    //     ['3.3.1', 3],
    //     ['3.3.1.1', 3],
    //     ['47.5.1', 60],
    //     ['47.5.1', 60],
    //     ['8.1.1', 9]
    //   ];
    //   it('Passes a bunch of test cases', () => {
    //     testCases.forEach(([timing, expectedRealTime]) => {
    //       const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
    //       const difference = Math.abs(expectedRealTime - calculatedRealTime);
    //       if (difference > 0.00000001)
    //         throw `${timing} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
    //     });
    //   });
    });
  });

});



// Removed test cases for tempo changes
// Relied on old TimeCoordinator.update function to change time
