import {EventEngine} from './EventEngine';

// TimeCoordinator handles all maths that need to be done with TimeParams
// In the EventEngine, time always marches forward (except when paused)
// In music-related objects, times are always between 0 and the length of the section
// A TimeCoordinator adjust times from the EventEngine to make sense to music objects
export function TimeCoordinator(timeParams:Banana.TimeParams): Banana.TimeCoordinator {
  const subscribers: ((...args:any[]) => void)[] = [];
  let secondsPerBar:Banana.RealTime, secondsPerSixteenth:Banana.RealTime, secondsPerBeat:Banana.RealTime, realTimeLength:Banana.RealTime;
  setInternalParams(); // Sets the variables above

  // Tempo and length changes incur offset changes
  let cachedTempo = timeParams.tempo;
  let cachedLength = timeParams.length;
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
  function convertToLoopIntervals({start, end}:Banana.Interval):Banana.LoopInterval[] {
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


  // We must only ever have one timeParam change at a time
  function handleTimeParamsChange() {
    if (timeParams.tempo !== cachedTempo)
      handleTempoChange(); // MUST call setInternalParams
    else if (timeParams.length !== cachedLength)
      handleLengthChange(); // MUST call setInternalParams
    else
      setInternalParams();
    publish();
  }


  // A tempo change shrinks or stretches the whole piece across real time
  // The audio-time does not change, so we are jumped to a different point in the music
  // We use offset to move back to the correct point in the music
  function handleTempoChange() {
    setInternalParams();
    const oldTempo = cachedTempo;
    const newTempo = timeParams.tempo;
    const audioTime = EventEngine.getTime();
    const oldOffsetTime = audioTime + offset;
    const newOffsetTime = oldOffsetTime * (oldTempo / newTempo);
    offset = newOffsetTime - audioTime;
    cachedTempo = newTempo;
  }


  // A length change means that audio time no longer lines up with the same loop, or bar within the loop
  // We use offset to move back to the correct loop and bar within it
  function handleLengthChange() {
    const oldRealTimeLength = realTimeLength;
    setInternalParams();

    const audioTime = EventEngine.getTime();
    const oldOffsetTime = audioTime + offset;

    const oldTimeWithinLoop = oldOffsetTime % oldRealTimeLength;
    const targetTimeWithinLoop = oldTimeWithinLoop % realTimeLength;
    let loopsFinished = Math.floor(oldOffsetTime / oldRealTimeLength);

    // Prevent moving earlier into the same loop, which, musically, we've already played
    if (targetTimeWithinLoop < oldTimeWithinLoop)
      loopsFinished++;

    const newOffsetTime = (loopsFinished * realTimeLength) + targetTimeWithinLoop;
    offset = newOffsetTime - audioTime;
  }
}


// Assumption: tempo is quarter-notes per minute, no matter the time signature
function calcNoteTimes({timeSignature, tempo}:Banana.PackedTimeParams) {
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
