// Timing strings look like this: 2.3.1
// That format is bars.beats.16ths
//   Note that if the beat-unit (the denominator of the time signature)
//   if 16 or greater, the third value of the timing string will always be 1
// It can continue to smaller time divisions: bars.beats.16ths.64ths.256ths...
// This instant at the beginning of a song is 1.1.1
// All trailing .1's can be chopped though, so the timing string will just be '1'

// For triplets, the timing will look like this: 2.3.2T, or 4.1TT
// Each T indicates adding a third of the real time of the timing at the level it appears
// It is confusing.

// Assumption: tempo is quarter-notes per minute, no matter the time signature
export function TimeConverter(params:PackedTimeParams): TimeConverter {
  const {secondsPerBar, secondsPerSixteenth, secondsPerBeat} = calcNoteTimes(params);
  const realTimeLength = convertToRealTime(`${params.length + 1}.1.1`);

  return {convertToRealTime, getLoopIntervals, getLoopRealTime};


  function convertToRealTime(timing:string): number {
    let seconds = 0;
    const multipliers = timing.split('.').map(convertToMultiplier);

    const barMultiplier = multipliers[0];
    seconds += barMultiplier * secondsPerBar;

    const beatMultiplier = multipliers[1]; // Usually quarter-beats
    seconds += beatMultiplier * secondsPerBeat;

    const sixteenthMultiplier = multipliers[2];
    seconds += sixteenthMultiplier * secondsPerSixteenth;

    // Now for the optional 4th bit
    const sixtyfourthMultiplier = multipliers[3];
    if (sixtyfourthMultiplier)
      seconds += sixteenthMultiplier * secondsPerSixteenth / 4;

    return seconds;
  }

  // Takes an interval whose times may be beyond the end of the loop
  // And returns up to two intervals with times within the loop
  // The two new intervals will cover the same total amount of time
  function getLoopIntervals({start, end}:Interval):LoopInterval[] {
    const startLoopNumber = Math.floor(start / realTimeLength);
    const adjustedStart = start % realTimeLength;
    const endLoopNumber = Math.floor(end / realTimeLength);
    const adjustedEnd = end % realTimeLength;

    if (startLoopNumber === endLoopNumber) {
      return [
        {
          loopNumber:startLoopNumber,
          start:adjustedStart,
          end:adjustedEnd
        }
      ];
    }

    // If the end-loop is different to the start-loop, this interval is overflowing the loopNumber
    // So we return a segment at the end of the loop, and a segment at the beginning
    // We're assuming at the moment that a note-request-interval is not longer than a loop
    return [
      {
        loopNumber:startLoopNumber,
        start:adjustedStart,
        end:realTimeLength
      },
      {
        loopNumber:endLoopNumber,
        start:0,
        end:adjustedEnd
      }
    ];
  }

  // Take a time relative to the start of a particular loop
  // And return a time relative to time zero
  function getLoopRealTime(realTime:number, loopNumber:number) {
    return realTime + (loopNumber * realTimeLength);
  }
}


function calcNoteTimes({timeSignature, tempo}:PackedTimeParams) {
  const [beatsPerBar, beatUnit] = timeSignature.split('/').map(stringValue => Number(stringValue));

  // Lay some ground work...
  const sixteenthsPerBeat = 16 / beatUnit;
  const sixteenthsPerBar = sixteenthsPerBeat * beatsPerBar;

  // And produce our actually useful values
  const secondsPerBar = (sixteenthsPerBar / tempo) * 15;
  const secondsPerSixteenth = 15 / tempo;
  const secondsPerBeat = secondsPerSixteenth * sixteenthsPerBeat;

  return {secondsPerBar, secondsPerSixteenth, secondsPerBeat};
}

// timingBit looks like '2', '3T', or '1TT'
// The T's indicate adding some triplet spice to this note, so adding thirds
// The base value is 1 at time=0, so we have to subtract 1
function convertToMultiplier(timingBit: string): number {
  const split = timingBit.split('T');
  const baseMultiplier = Number(split[0]) - 1; // Because we start on the 1
  if (split.length === 1)
    return baseMultiplier;
  if (split.length === 2)
    return baseMultiplier + 0.333333333333333333333;
  if (split.length === 3)
    return baseMultiplier + 0.666666666666666666666;
}
