import {Publisher} from './Publisher';

export function TimeParams(packedParams:Banana.PackedTimeParams): Banana.TimeParams {
  let {timeSignature, tempo, length} = packedParams;
  const publisher:Banana.Publisher = Publisher();

return {
  get timeSignature() { return timeSignature; },
  set timeSignature(newTimeSignature: string) {
    if (newTimeSignature !== timeSignature) {
      timeSignature = newTimeSignature;
      publisher.publish();
    }
  },

  get tempo() { return tempo; },
  set tempo(newTempo: number) {
    if (!validateTempo(newTempo))
      throw 'Invalid tempo';
    if (newTempo !== tempo) {
      tempo = newTempo;
      publisher.publish();
    }
  },

  get length() { return length; },
  set length(newLength: number) {
    if (!validateLength(newLength))
      throw 'Invalid length';
    if (newLength !== length) {
      length = newLength;
      publisher.publish();
    }
  },

  subscribe: publisher.subscribe,
  unsubscribe: publisher.unsubscribe,

  isValid(timing:Banana.Timing) {
    const [bar, beat] = timing.split('.').map(bit => Number(bit));
    if (bar > length)
      return false; // timing falls outside the arrangement entirely

    const beatsPerBar = Number(timeSignature.split('/')[0]);
    if (beat > beatsPerBar)
      return false;
    return true;
  }
}
}


// The only invalid tempos are negative... unless we want to play backwards!
// That's an idea for another time
function validateTempo(tempo:number) {
  if (tempo < 1)
    return false;
  return true;
}


// Lengths must be natural numbers for now
// Later we may want half-bar breaks, etc
function validateLength(length:number) {
  if (length <= 0)
    return false;
  if (length != Math.floor(length))
    return false;
  return true;
}
