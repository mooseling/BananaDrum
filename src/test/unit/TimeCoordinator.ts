import {assert} from 'chai';
import {TimeCoordinator} from '../../prod/TimeCoordinator';
import {TimeParams} from '../../prod/TimeParams';

type TestCase = [Banana.Timing, number];
type ApproxTestCase = [number, Banana.ApproxTiming];
type PTP = Banana.PackedTimeParams;

const packedTimeParams44:PTP = {timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16};
const packedTimeParams68:PTP = {timeSignature:'6/8', tempo:120, length:1, pulse:'3/8', stepResolution:8};
const packedTimeParams68_140:PTP = {timeSignature:'6/8', tempo:140, length:1, pulse:'3/8', stepResolution:8}
const packedTimeParams54:PTP = {timeSignature:'5/4', tempo:90, length:1, pulse:'1/2', stepResolution:8};

describe('TimeCoordinator', function() {



  // ==================================================================
  //                          Time Conversion
  // ==================================================================


  describe('Time conversion', function() {
    describe('4/4 time, 120bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams44));

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
          assert(closeEnough(calculatedRealTime, expectedRealTime),
            `${toString(timing)} converted to ${calculatedRealTime} but expected ${expectedRealTime}`);
        });
      });
    });


    describe('6/8 time, 120bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams68));

      it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.16666666666666666],
        [{bar:1, step:3}, 0.33333333333333333],
        [{bar:1, step:4}, 0.5],
        [{bar:1, step:5}, 0.66666666666666666],
        [{bar:1, step:6}, 0.83333333333333333],
        [{bar:2, step:1}, 1],
        [{bar:2, step:4}, 1.5],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedRealTime]) => {
          const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
          assert(closeEnough(calculatedRealTime, expectedRealTime),
            `${toString(timing)} converted to ${calculatedRealTime} but expected ${expectedRealTime}`);
        });
      });
    });


    describe('6/8 time, 140bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams68_140));

      it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.14285714285714285],
        [{bar:1, step:3}, 0.2857142857142857],
        [{bar:1, step:4}, 0.42857142857142855],
        [{bar:1, step:5}, 0.5714285714285714],
        [{bar:1, step:6}, 0.7142857142857142],
        [{bar:2, step:1}, 0.8571428571428571],
        [{bar:5, step:1}, 3.4285714285714284],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedRealTime]) => {
          const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
          assert(closeEnough(calculatedRealTime, expectedRealTime),
            `${toString(timing)} converted to ${calculatedRealTime} but expected ${expectedRealTime}`);
        });
      });
    });


    describe('5/4 time, 90bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams54));

      it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.16666666666666666],
        [{bar:1, step:3}, 0.33333333333333333],
        [{bar:1, step:4}, 0.5],
        [{bar:1, step:5}, 0.66666666666666666],
        [{bar:1, step:6}, 0.83333333333333333],
        [{bar:1, step:7}, 1],
        [{bar:1, step:8}, 1.16666666666666666],
        [{bar:1, step:9}, 1.33333333333333333],
        [{bar:1, step:10}, 1.5],
        [{bar:2, step:1}, 1.66666666666666666],
        [{bar:100, step:1}, 165],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedRealTime]) => {
          const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
          assert(closeEnough(calculatedRealTime, expectedRealTime),
            `${toString(timing)} converted to ${calculatedRealTime} but expected ${expectedRealTime}`);
        });
      });
    });
  });



    // ==================================================================
    //                          Pulse Conversion
    // ==================================================================


  describe('Pulse conversion', function() {
    describe('4/4 time, 120bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams44));

      it('Returns 0 on the 1', () => assert(timeCoordinator.convertToPulses({bar:1, step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.25],
        [{bar:1, step:3}, 0.5],
        [{bar:1, step:4}, 0.75],
        [{bar:1, step:5}, 1],
        [{bar:1, step:6}, 1.25],
        [{bar:1, step:7}, 1.5],
        [{bar:1, step:8}, 1.75],
        [{bar:1, step:9}, 2],
        [{bar:1, step:10}, 2.25],
        [{bar:1, step:11}, 2.5],
        [{bar:1, step:12}, 2.75],
        [{bar:1, step:13}, 3],
        [{bar:1, step:14}, 3.25],
        [{bar:1, step:15}, 3.5],
        [{bar:1, step:16}, 3.75],
        [{bar:2, step:1}, 4],
        [{bar:100, step:1}, 396],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedPulses]) => {
          const calculatedPulses = timeCoordinator.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${toString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });

    describe('6/8 time, 120bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams68));

      it('Returns 0 on the 1', () => assert(timeCoordinator.convertToPulses({bar:1, step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.33333333333333333],
        [{bar:1, step:3}, 0.66666666666666666],
        [{bar:1, step:4}, 1],
        [{bar:1, step:5}, 1.33333333333333333],
        [{bar:1, step:6}, 1.66666666666666666],
        [{bar:2, step:1}, 2],
        [{bar:2, step:2}, 2.33333333333333333],
        [{bar:2, step:3}, 2.66666666666666666],
        [{bar:2, step:4}, 3],
        [{bar:2, step:5}, 3.33333333333333333],
        [{bar:2, step:6}, 3.66666666666666666],
        [{bar:3, step:1}, 4],
        [{bar:100, step:1}, 198],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedPulses]) => {
          const calculatedPulses = timeCoordinator.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${toString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });

    // Should all come out the same as 6/8 at 120
    describe('6/8 time, 140bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams68_140));

      it('Returns 0 on the 1', () => assert(timeCoordinator.convertToPulses({bar:1, step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.33333333333333333],
        [{bar:1, step:3}, 0.66666666666666666],
        [{bar:1, step:4}, 1],
        [{bar:1, step:5}, 1.33333333333333333],
        [{bar:1, step:6}, 1.66666666666666666],
        [{bar:2, step:1}, 2],
        [{bar:2, step:2}, 2.33333333333333333],
        [{bar:2, step:3}, 2.66666666666666666],
        [{bar:2, step:4}, 3],
        [{bar:2, step:5}, 3.33333333333333333],
        [{bar:2, step:6}, 3.66666666666666666],
        [{bar:3, step:1}, 4],
        [{bar:100, step:1}, 198],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedPulses]) => {
          const calculatedPulses = timeCoordinator.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${toString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });

    describe('5/4 time, 90bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams54));

      it('Returns 0 on the 1', () => assert(timeCoordinator.convertToPulses({bar:1, step:1}) === 0));

      const testCases:TestCase[] = [
        [{bar:1, step:2}, 0.25],
        [{bar:1, step:3}, 0.5],
        [{bar:1, step:4}, 0.75],
        [{bar:1, step:5}, 1],
        [{bar:1, step:6}, 1.25],
        [{bar:1, step:7}, 1.5],
        [{bar:1, step:8}, 1.75],
        [{bar:1, step:9}, 2],
        [{bar:1, step:10}, 2.25],
        [{bar:2, step:1}, 2.5],
        [{bar:2, step:2}, 2.75],
        [{bar:2, step:3}, 3],
        [{bar:2, step:4}, 3.25],
        [{bar:2, step:5}, 3.5],
        [{bar:2, step:6}, 3.75],
        [{bar:2, step:7}, 4],
        [{bar:2, step:8}, 4.25],
        [{bar:2, step:9}, 4.5],
        [{bar:2, step:10}, 4.75],
        [{bar:3, step:1}, 5],
        [{bar:100, step:1}, 247.5],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([timing, expectedPulses]) => {
          const calculatedPulses = timeCoordinator.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${toString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });
  });



  // ==================================================================
  //                          Timing Approximation
  // ==================================================================

  describe('Timing Approximation', function() {
    describe('4/4 time, 120bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams44));

      const testCases:ApproxTestCase[] = [
        [0, {bar:1, step:1, score:1}],
        [0.125, {bar:1, step:2, score:0}],
        [0.0625, {bar:1, step:1, score:0.5}],
        [0.25, {bar:1, step:2, score:1}],
        [0.5, {bar:1, step:3, score:1}]
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([pulses, expectedApproxTiming]) => {
          const approximatedTiming = timeCoordinator.convertToApproxTiming(pulses);
          assert(isSameApproxTiming(approximatedTiming, expectedApproxTiming),
            `${pulses} pulses converted to ${toString(approximatedTiming)} pulses but expected ${toString(expectedApproxTiming)}`);
        });
      });
    });

    describe('6/8 time, 120bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams68));

      const testCases:ApproxTestCase[] = [
        [0, {bar:1, step:1, score:1}],
        [0.25, {bar:1, step:2, score:0.5}],
        [0.33333333333333333, {bar:1, step:2, score:1}],
        [0.5, {bar:1, step:3, score:0}]
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([pulses, expectedApproxTiming]) => {
          const approximatedTiming = timeCoordinator.convertToApproxTiming(pulses);
          assert(isSameApproxTiming(approximatedTiming, expectedApproxTiming),
            `${pulses} pulses converted to ${toString(approximatedTiming)} pulses but expected ${toString(expectedApproxTiming)}`);
        });
      });
    });

    describe('5/4 time, 90bpm', function() {
      const timeCoordinator = TimeCoordinator(TimeParams(packedTimeParams54));

      const testCases:ApproxTestCase[] = [
        [0, {bar:1, step:1, score:1}],
        [1.25, {bar:1, step:6, score:1}],
        [2.5, {bar:2, step:1, score:1}],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([pulses, expectedApproxTiming]) => {
          const approximatedTiming = timeCoordinator.convertToApproxTiming(pulses);
          assert(isSameApproxTiming(approximatedTiming, expectedApproxTiming),
            `${pulses} pulses converted to ${toString(approximatedTiming)} pulses but expected ${toString(expectedApproxTiming)}`);
        });
      });
    });
  });
});



function closeEnough(value1:number, value2:number, threshold = 0.00000001): boolean {
  return Math.abs(value1 - value2) < threshold;
}

function isSameApproxTiming(t1:Banana.ApproxTiming, t2:Banana.ApproxTiming): boolean {
  return (t1.bar === t2.bar) && (t1.step === t2.step) && closeEnough(t1.score, t2.score);
}

type TimingLike = {bar:number, step:number, score?:number}
function toString(timing:TimingLike): string {
  if (timing.score !== undefined)
    return `${timing.bar}.${timing.step}@${timing.score}`;
  return `${timing.bar}.${timing.step}`;
}

// Removed test cases for tempo changes
// Relied on old TimeCoordinator.update function to change time
