import {AudioPlayer} from './AudioPlayer';

// TimeCoordinator handles all maths that need to be done with TimeParams
// In the AudioPlayer, time always marches forward (except when paused)
// In music-related objects, times are always between 0 and the length of the section
// A TimeCoordinator adjust times from the AudioPlayer to make sense to music objects
export function TimeCoordinator(timeParams:TimeParams): TimeCoordinator {
  const subscribers: ((...args:any[]) => void)[] = [];
  let secondsPerBar:RealTime, secondsPerSixteenth:RealTime, secondsPerBeat:RealTime, realTimeLength:RealTime;
  setInternalParams(); // Sets the variables above

  // Tempo changes incur offset changes, and we have to know what the change actually was
  let cachedTempo = timeParams.tempo; //
  let offset = 0;

  timeParams.subscribe(handleTimeParamsChange);

  return {convertToRealTime, convertToLoopIntervals, convertToAudioTime, subscribe};






  // ==================================================================
  //                          Public Functions
  // ==================================================================


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
  function convertToLoopIntervals({start, end}:Interval):LoopInterval[] {
    const offsetStart = start + offset;
    const offsetEnd = end + offset;
    const startLoopNumber = Math.floor(offsetStart / realTimeLength);
    const endLoopNumber = Math.floor(offsetEnd / realTimeLength);
    const adjustedStart = offsetStart % realTimeLength;
    const adjustedEnd = offsetEnd % realTimeLength;

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
  function convertToAudioTime(realTime:number, loopNumber:number) {
    return realTime + (loopNumber * realTimeLength) - offset;
  }


  function subscribe(callback:(...args:any[]) => void): void {
    subscribers.push(callback);
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================


  function publish() {
    subscribers.forEach(callback => callback());
  }


  function setInternalParams() {
    ({secondsPerBar, secondsPerSixteenth, secondsPerBeat} = calcNoteTimes(timeParams));
    realTimeLength = convertToRealTime(`${timeParams.length + 1}.1.1`);
  }


  function handleTimeParamsChange() {
    setInternalParams();
    if (timeParams.tempo !== cachedTempo)
      handleTempoChange();
    publish();
  }


  // When the tempo changes we recalculate offset
  function handleTempoChange() {
    const oldTempo = cachedTempo;
    const newTempo = timeParams.tempo;
    const audioTime = AudioPlayer.getTime();
    const oldTime = audioTime + offset;
    const newTime = oldTime * (oldTempo / newTempo);
    offset = newTime - audioTime;
    cachedTempo = newTempo;
  }
}


// Assumption: tempo is quarter-notes per minute, no matter the time signature
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
