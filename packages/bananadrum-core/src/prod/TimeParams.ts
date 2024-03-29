import { TimeParams, Timing } from './types.js';
import { createPublisher } from './Publisher.js';

export function createTimeParams(
    timeSignature: string, tempo: number, length: number, pulse: string, stepResolution: number): TimeParams {
  const publisher = createPublisher();
  const timings:Timing[] = [];
  regenerateTimings();

  return {
    get timeSignature() { return timeSignature; },
    set timeSignature(newTimeSignature: string) {
      if (!validateTimeSignature(newTimeSignature))
        throw 'Invalid time signature';
      if (newTimeSignature !== timeSignature) {
        timeSignature = newTimeSignature;
        regenerateTimings();
        publisher.publish();
      }
    },

    get tempo() { return tempo; },
    set tempo(newTempo: number) {
      if (!validateTempo(newTempo))
        throw 'Invalid tempo';
      if (newTempo !== tempo) {
        tempo = newTempo;
        regenerateTimings();
        publisher.publish();
      }
    },

    get length() { return length; },
    set length(newLength: number) {
      if (!validateLength(newLength))
        throw 'Invalid length';
      if (newLength !== length) {
        length = newLength;
        regenerateTimings();
        publisher.publish();
      }
    },

    get pulse() { return pulse; },
    set pulse(newPulse:string) {
      if (!validatePulse(newPulse))
        throw 'Invalid pulse';
      if (newPulse !== pulse) {
        pulse = newPulse;
        regenerateTimings();
        publisher.publish();
      }
    },

    get stepResolution() { return stepResolution; },
    set stepResolution(newStepResolution:number) {
      if (!validateNoteValue(newStepResolution))
        throw 'Invalid pulse';
      if (newStepResolution !== stepResolution) {
        stepResolution = newStepResolution;
        regenerateTimings();
        publisher.publish();
      }
    },

    subscribe: publisher.subscribe,
    unsubscribe: publisher.unsubscribe,

    isValid({bar, step}:Timing) {
      if (bar > length)
        return false; // timing falls outside the arrangement entirely

      const [beatsPerBar, beatUnit] = timeSignature.split('/').map(value => Number(value));
      const stepsPerBeat = stepResolution / beatUnit;
      const stepsPerBar = stepsPerBeat * beatsPerBar;
      if (step > stepsPerBar)
        return false;

      return true;
    },
    timings
  }


  // Whenever any params change, we generate the list of timings from scratch again
  function regenerateTimings() {
    timings.length = 0;
    const [beatsPerBar, beatNoteValue] = timeSignature.split('/').map((value: string) => Number(value));
    const stepsPerBeat = stepResolution / beatNoteValue;
    const stepsPerBar = stepsPerBeat * beatsPerBar;
    for (let bar = 1; bar <= length; bar++) {
      for (let step = 1; step <= stepsPerBar; step++)
        timings.push({bar, step});
    }
  }
}


function validateTimeSignature(timeSignature:string): boolean {
  const [beatsPerBar, beatUnit] = timeSignature.split('/').map((value: string) => Number(value));
  if (!validateNaturalNumber(beatsPerBar))
    return false;
  if (!validateNoteValue(beatUnit))
    return false;
  return true;
}


// The only invalid tempos are negative... unless we want to play backwards!
// That's an idea for another time
function validateTempo(tempo:number) {
  if (isNaN(tempo) || tempo < 1)
    return false;
  return true;
}


// Lengths must be natural numbers for now
// Later we may want half-bar breaks, etc
function validateLength(length:number) {
  if (isNaN(length) || length <= 0)
    return false;
  if (length != Math.floor(length))
    return false;
  return true;
}


// Pulses are natural numbers of kinds of notes (often 8ths)
// For example, 4/4 is usually beat = 8ths, 6/8 is beat = 3/8ths
function validatePulse(pulse:string): boolean {
  const [noteCount, noteResolution] = pulse.split('/').map(str => Number(str));
  if (!validateNoteValue(noteResolution))
    return false;
  if (!validateNaturalNumber(noteCount))
    return false;
  return true;
}


function validateNaturalNumber(number:number): boolean {
  if (isNaN(number))
    return false;
  if (Math.floor(number) !== number)
    return false;
  if (number < 1)
    return false;
  return true;
}


// Note values are always powers of 2, meaning crotchets, quavers, minums... all that jazz
function validateNoteValue(noteValue:number): boolean {
  if (!validateNaturalNumber(noteValue))
    return false;
  if (noteValue % 2 !== 0)
    return false;
  return true;
}
