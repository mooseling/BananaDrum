import {assert} from 'chai';
import {TimeCoordinator} from '../../prod/TimeCoordinator';
import {TimeParams} from '../../prod/TimeParams';

type TestCase = [Timing, number];

describe('TimeCoordinator', function() {
  describe('Time conversion', function() {
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

  // describe('Tempo changes', function() {
  //   describe('Test case: 120bpm, no changes', function() {
  //     const timeParams:TimeParams = TimeParams({timeSignature:'4/4', tempo:120, length:1});
  //     const timeCoordinator = TimeCoordinator(timeParams);
  //
  //     it('offsets an interval by 0 initially', () => {
  //       const interval = {start:0, end:0.5};
  //       const offsetInterval = timeCoordinator.convertToLoopIntervals(interval);
  //       assert(interval.start === offsetInterval.start, `Interval start: ${offsetInterval.start}`);
  //       assert(interval.end === offsetInterval.end, `Interval end: ${offsetInterval.end}`);
  //     });
  //   });
  //
  //
  //   describe('Test case: 120bpm, change to 140bpm at 25s', function() {
  //     const timeCoordinator = TimeCoordinator(120);
  //     timeCoordinator.update(140, 25);
  //
  //     it('25 --> 21.428571428571', () => {
  //       const offsetTime = timeCoordinator.getTime(25);
  //       assert(compare(offsetTime, 21.428571428571), `Offset time was ${offsetTime}`);
  //     });
  //
  //     // We know the offset, so let's just fuzz
  //     it('passes some fuzzer cases', () => fuzzTest(timeCoordinator, 25, -3.571428571428573));
  //   });
  //
  //
  //   describe('Test case: 150bpm, change to 100bpm at 5s', function() {
  //     const timeCoordinator = TimeCoordinator(150);
  //     timeCoordinator.update(100, 5);
  //
  //     it('5 --> 7.5', () => {
  //       const offsetTime = timeCoordinator.getTime(5);
  //       assert(compare(offsetTime, 7.5), `Offset time was ${offsetTime}`);
  //     });
  //
  //     // We know the offset, so let's just fuzz
  //     it('passes some fuzzer cases', () => fuzzTest(timeCoordinator, 5, 2.5));
  //   });
  //
  //
  //   describe('Test case: 130bpm, change to 100bpm at 12s, change to 110bpm at 99s', function() {
  //     const timeCoordinator = TimeCoordinator(130);
  //     timeCoordinator.update(100, 12);
  //     timeCoordinator.update(110, 95.4); // 95.4 is audio-time, effective time is 99
  //
  //     it('100 --> 94.6', () => {
  //       const offsetTime = timeCoordinator.getTime(100);
  //       assert(compare(offsetTime, 94.6), `Offset time was ${offsetTime}`);
  //     });
  //
  //     // We know the offset, so let's just fuzz
  //     it('passes some fuzzer cases', () => fuzzTest(timeCoordinator, 99, -5.4));
  //   });
  // });
});



// function compare(number1:number, number2:number) {
//   // We're talking seconds here, and we need ms to be correct
//   // Therefore this tolerance should be excessive
//   const tolerance = 0.0000001;
//   return Math.abs(number1 - number2) < tolerance;
// }
//
// function fuzzTest(timeCoordinator:TimeCoordinator, min:number, expectedOffset:number) {
//   const fuzzer = TimeFuzzer(min); // min time is the time of the tempo change
//   for (let i = 0; i < 100; i++) {
//     const time = fuzzer.get();
//     const offsetTime = timeCoordinator.getAudioTime(time);
//     const expectedTime = time + expectedOffset;
//     assert(
//       compare(offsetTime, expectedTime),
//       `Expected ${expectedTime}, got ${offsetTime}`
//     );
//   }
// }
// // We never want to offset a time before the time of tempo change
// // Offsetting such times can return negatives
// // So for our time fuzzer, we just want to get times later than the tempo change
// function TimeFuzzer(min:RealTime): {get():RealTime} {
//   return { get: () => min + (1000000 * Math.random()) };
// }
