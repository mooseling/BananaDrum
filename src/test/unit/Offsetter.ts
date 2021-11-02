import {assert} from 'chai';
import {Offsetter} from '../../prod/Offsetter';

describe('Offsetter', function() {
  describe('Test case: 120bpm, no changes', function() {
    const offsetter = Offsetter(120);

    it('offsets by a time by 0 initially', () => {
      const time = 40;
      const offsetTime = offsetter.getTime(time);
      assert(time === offsetTime, `Offset time was ${offsetTime}`);
    });

    it('offsets an interval by 0 initially', () => {
      const interval = {start:50, end:51};
      const offsetInterval = offsetter.getInterval(interval);
      assert(interval.start === offsetInterval.start, `Interval start: ${offsetInterval.start}`);
      assert(interval.end === offsetInterval.end, `Interval end: ${offsetInterval.end}`);
    });
  });


  describe('Test case: 120bpm, change to 140bpm at 25s', function() {
    const offsetter = Offsetter(120);
    offsetter.update(140, 25);

    it('25 --> 21.428571428571', () => {
      const offsetTime = offsetter.getTime(25);
      assert(compare(offsetTime, 21.428571428571), `Offset time was ${offsetTime}`);
    });

    // We know the offset, so let's just fuzz
    it('passes some fuzzer cases', () => fuzzTest(offsetter, 25, -3.571428571428573));
  });


  describe('Test case: 150bpm, change to 100bpm at 5s', function() {
    const offsetter = Offsetter(150);
    offsetter.update(100, 5);

    it('5 --> 7.5', () => {
      const offsetTime = offsetter.getTime(5);
      assert(compare(offsetTime, 7.5), `Offset time was ${offsetTime}`);
    });

    // We know the offset, so let's just fuzz
    it('passes some fuzzer cases', () => fuzzTest(offsetter, 5, 2.5));
  });


  describe('Test case: 130bpm, change to 100bpm at 12s, change to 110bpm at 99s', function() {
    const offsetter = Offsetter(130);
    offsetter.update(100, 12);
    offsetter.update(110, 95.4); // 95.4 is audio-time, effective time is 99

    it('100 --> 94.6', () => {
      const offsetTime = offsetter.getTime(100);
      assert(compare(offsetTime, 94.6), `Offset time was ${offsetTime}`);
    });

    // We know the offset, so let's just fuzz
    it('passes some fuzzer cases', () => fuzzTest(offsetter, 99, -5.4));
  });
});


function compare(number1:number, number2:number) {
  // We're talking seconds here, and we need ms to be correct
  // Therefore this tolerance should be excessive
  const tolerance = 0.0000001;
  return Math.abs(number1 - number2) < tolerance;
}

function fuzzTest(offsetter:Offsetter, min:number, expectedOffset:number) {
  const fuzzer = TimeFuzzer(min); // min time is the time of the tempo change
  for (let i = 0; i < 100; i++) {
    const time = fuzzer.get();
    const offsetTime = offsetter.getTime(time);
    const expectedTime = time + expectedOffset;
    assert(
      compare(offsetTime, expectedTime),
      `Expected ${expectedTime}, got ${offsetTime}`
    );
  }
}
// We never want to offset a time before the time of tempo change
// Offsetting such times can return negatives
// So for our time fuzzer, we just want to get times later than the tempo change
function TimeFuzzer(min:RealTime): {get():RealTime} {
  return { get: () => min + (1000000 * Math.random()) };
}
