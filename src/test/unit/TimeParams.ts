import {assert} from 'chai';
import {TimeParams} from '../../prod/TimeParams';
import {closeEnough, timingToString, isSameApproxTiming} from '../lib/utils';

type TestCase = [Banana.Timing, number];
type ApproxTestCase = [number, Banana.ApproxTiming];
type PTP = Banana.PackedTimeParams;

const packedTimeParams44:PTP = {timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16};
const packedTimeParams68:PTP = {timeSignature:'6/8', tempo:120, length:1, pulse:'3/8', stepResolution:8};
const packedTimeParams68_140:PTP = {timeSignature:'6/8', tempo:140, length:1, pulse:'3/8', stepResolution:8}
const packedTimeParams54:PTP = {timeSignature:'5/4', tempo:90, length:1, pulse:'1/2', stepResolution:8};

describe('TimeParams', function() {
  const initialTimeSignature = '4/4';
  const initialTempo = 120;
  const initialLength = 1;
  const timeParams = TimeParams({
    timeSignature:initialTimeSignature,
    tempo:initialTempo,
    length:initialLength,
    pulse:'1/4',
    stepResolution:8
  });
  let updateCount = 0;
  timeParams.subscribe(() => updateCount++)

  it('has the right properties initially', () => {
    assert(timeParams.timeSignature === initialTimeSignature);
    assert(timeParams.tempo === initialTempo);
    assert(timeParams.length === initialLength);
  });

  it('can be updated', () => {
    const newTimeSignature = '5/4';
    const newTempo = 140
    const newLength = 2
    timeParams.timeSignature = newTimeSignature;
    timeParams.tempo = newTempo;
    timeParams.length = newLength;
    assert(timeParams.timeSignature === newTimeSignature);
    assert(timeParams.tempo === newTempo);
    assert(timeParams.length === newLength);
  });

  it('publishes when it is changed', () => {
    timeParams.timeSignature = '4/4';
    timeParams.tempo = 120;
    timeParams.length = 1;
    const initialUpdateCount = updateCount;
    timeParams.timeSignature = '5/4';
    assert(updateCount === initialUpdateCount + 1);
    timeParams.tempo = 140;
    assert(updateCount === initialUpdateCount + 2);
    timeParams.length = 2;
    assert(updateCount === initialUpdateCount + 3);
  });

  it("...but doesn't publish when edits don't actually change anything", () => {
    timeParams.timeSignature = '4/4';
    timeParams.tempo = 120;
    timeParams.length = 1;
    const initialUpdateCount = updateCount;
    timeParams.timeSignature = '4/4';
    assert(updateCount === initialUpdateCount);
    timeParams.tempo = 120;
    assert(updateCount === initialUpdateCount);
    timeParams.length = 1;
    assert(updateCount === initialUpdateCount);
  });

  // ==================================================================
  //                          Pulse Conversion
  // ==================================================================


  describe('Pulse conversion', function() {
    describe('4/4 time, 120bpm', function() {
      const timeParams = TimeParams(packedTimeParams44);

      it('Returns 0 on the 1', () => assert(timeParams.convertToPulses({bar:1, step:1}) === 0));

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
          const calculatedPulses = timeParams.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${timingToString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });

    describe('6/8 time, 120bpm', function() {
      const timeParams = TimeParams(packedTimeParams68);

      it('Returns 0 on the 1', () => assert(timeParams.convertToPulses({bar:1, step:1}) === 0));

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
          const calculatedPulses = timeParams.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${timingToString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });

    // Should all come out the same as 6/8 at 120
    describe('6/8 time, 140bpm', function() {
      const timeParams = TimeParams(packedTimeParams68_140);

      it('Returns 0 on the 1', () => assert(timeParams.convertToPulses({bar:1, step:1}) === 0));

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
          const calculatedPulses = timeParams.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${timingToString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });

    describe('5/4 time, 90bpm', function() {
      const timeParams = TimeParams(packedTimeParams54);

      it('Returns 0 on the 1', () => assert(timeParams.convertToPulses({bar:1, step:1}) === 0));

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
          const calculatedPulses = timeParams.convertToPulses(timing);
          assert(closeEnough(calculatedPulses, expectedPulses),
            `${timingToString(timing)} converted to ${calculatedPulses} pulses but expected ${expectedPulses}`);
        });
      });
    });
  });



  // ==================================================================
  //                          Timing Approximation
  // ==================================================================

  describe('Timing Approximation', function() {
    describe('4/4 time, 120bpm', function() {
      const timeParams = TimeParams(packedTimeParams44);

      const testCases:ApproxTestCase[] = [
        [0, {bar:1, step:1, score:1}],
        [0.125, {bar:1, step:2, score:0}],
        [0.0625, {bar:1, step:1, score:0.5}],
        [0.25, {bar:1, step:2, score:1}],
        [0.5, {bar:1, step:3, score:1}]
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([pulses, expectedApproxTiming]) => {
          const approximatedTiming = timeParams.convertToApproxTiming(pulses);
          assert(isSameApproxTiming(approximatedTiming, expectedApproxTiming),
            `${pulses} pulses converted to ${timingToString(approximatedTiming)} pulses but expected ${timingToString(expectedApproxTiming)}`);
        });
      });
    });

    describe('6/8 time, 120bpm', function() {
      const timeParams = TimeParams(packedTimeParams68);

      const testCases:ApproxTestCase[] = [
        [0, {bar:1, step:1, score:1}],
        [0.25, {bar:1, step:2, score:0.5}],
        [0.33333333333333333, {bar:1, step:2, score:1}],
        [0.5, {bar:1, step:3, score:0}]
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([pulses, expectedApproxTiming]) => {
          const approximatedTiming = timeParams.convertToApproxTiming(pulses);
          assert(isSameApproxTiming(approximatedTiming, expectedApproxTiming),
            `${pulses} pulses converted to ${timingToString(approximatedTiming)} pulses but expected ${timingToString(expectedApproxTiming)}`);
        });
      });
    });

    describe('5/4 time, 90bpm', function() {
      const timeParams = TimeParams(packedTimeParams54);

      const testCases:ApproxTestCase[] = [
        [0, {bar:1, step:1, score:1}],
        [1.25, {bar:1, step:6, score:1}],
        [2.5, {bar:2, step:1, score:1}],
      ];
      it('Passes a bunch of test cases', () => {
        testCases.forEach(([pulses, expectedApproxTiming]) => {
          const approximatedTiming = timeParams.convertToApproxTiming(pulses);
          assert(isSameApproxTiming(approximatedTiming, expectedApproxTiming),
            `${pulses} pulses converted to ${timingToString(approximatedTiming)} pulses but expected ${timingToString(expectedApproxTiming)}`);
        });
      });
    });
  });
});
