import { RealTime, TimeParams, Timing } from 'bananadrum-core';
import { createPublisher } from 'bananadrum-core';
import { getEventEngine } from './EventEngine.js';
import { Interval, LoopInterval, TimeCoordinator } from './types.js';


const eventEngine = getEventEngine();


// TimeCoordinator handles all maths that need to be done with TimeParams
// In the EventEngine, time always marches forward (except when paused)
// In music-related objects, times are always between 0 and the length of the section
// A TimeCoordinator adjust times from the EventEngine to make sense to music objects
export function createTimeCoordinator(timeParams:TimeParams): TimeCoordinator {
  const publisher = createPublisher();
  let secondsPerBar:RealTime, secondsPerStep:RealTime, realTimeLength:RealTime;
  setInternalParams(); // Sets the variables above

  // Tempo and length changes incur offset changes
  let cachedTempo = timeParams.tempo;
  let cachedLength = timeParams.length;
  let offset = 0;

  timeParams.subscribe(handleTimeParamsChange);
  eventEngine.subscribe(handlePlaybackChange)

  return {convertToRealTime, convertToLoopIntervals, convertToAudioTime, convertToLoopProgress, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  // Converting is currently extremely easy, but will become more complicated with polyrhythms
  function convertToRealTime(timing:Timing): RealTime {
    return (secondsPerBar * (timing.bar - 1)) + (secondsPerStep * (timing.step - 1));
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


  function convertToLoopProgress(realTime:number): RealTime {
    return ((realTime + offset) % realTimeLength) / realTimeLength;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================


  function setInternalParams() {
    ({secondsPerBar, secondsPerStep} = calcNoteTimes(timeParams));
    realTimeLength = convertToRealTime({bar:timeParams.length + 1, step:1});
  }


  // We must only ever have one timeParam change at a time
  function handleTimeParamsChange() {
    if (timeParams.tempo !== cachedTempo)
      handleTempoChange(); // MUST call setInternalParams
    else if (timeParams.length !== cachedLength)
      handleLengthChange(); // MUST call setInternalParams
    else
      setInternalParams();
    publisher.publish();
  }


  // A tempo change shrinks or stretches the whole piece across real time
  // The audio-time does not change, so we are jumped to a different point in the music
  // We use offset to move back to the correct point in the music
  function handleTempoChange() {
    setInternalParams();
    const oldTempo = cachedTempo;
    const newTempo = timeParams.tempo;
    const audioTime = eventEngine.getTime();
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

    const audioTime = eventEngine.getTime();
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


  function handlePlaybackChange() {
    if (eventEngine.state !== 'playing')
      offset = 0;
  }
}





// ==================================================================
//                       Private Static Functions
// ==================================================================


function calcNoteTimes({timeSignature, tempo, pulse, stepResolution}:TimeParams) {
  const [beatsPerBar, beatUnit] = timeSignature.split('/').map(str => Number(str));
  const [pulseFrequency, pulseResolution] = pulse.split('/').map(str => Number(str));

  // Lay some ground work...
  const stepsPerBeat = stepResolution / beatUnit;
  const stepsPerBar = stepsPerBeat * beatsPerBar;
  const stepsPerPulse = stepResolution * pulseFrequency / pulseResolution;
  const secondsPerPulse = 60 / tempo;

  // And produce our actually useful values
  const secondsPerStep = secondsPerPulse / stepsPerPulse;
  const secondsPerBar = secondsPerStep * stepsPerBar;

  return {secondsPerBar, secondsPerStep};
}
