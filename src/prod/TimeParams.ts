export function TimeParams(packedParams:PackedTimeParams): TimeParams {
  let {timeSignature, tempo, length} = packedParams;
  let subscribers: ((...args:any[]) => void)[] = [];

return {
  get timeSignature() { return timeSignature; },
  set timeSignature(newTimeSignature: string) {
    if (newTimeSignature !== timeSignature) {
      timeSignature = newTimeSignature;
      publish();
    }
  },
  get tempo() { return tempo; },
  set tempo(newTempo: number) {
    if (newTempo !== tempo) {
      tempo = newTempo;
      publish();
    }
  },
  get length() { return length; },
  set length(newLength: number) {
    if (!validateLength(newLength))
      throw 'Invalid length';
    if (newLength !== length) {
      length = newLength;
      publish();
    }
  },
  subscribe(callback: (...args:any[]) => void) {
    subscribers.push(callback);
  },
  // Timings
  isValid(timing:Timing) {
    const [bar, beat] = timing.split('.').map(bit => Number(bit));
    if (bar > length)
      return false; // timing falls outside the arrangement entirely

    const beatsPerBar = Number(timeSignature.split('/')[0]);
    if (beat > beatsPerBar)
      return false;
    return true;
  }
}


  function publish(): void {
    subscribers.forEach(callback => callback());
  }
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
