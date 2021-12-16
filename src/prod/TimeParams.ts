export function TimeParams(packedParams:Banana.PackedTimeParams): Banana.TimeParams {
  let {timeSignature, tempo, length} = packedParams;
  let subscriptions: Banana.Subscription[] = [];

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
    if (!validateTempo(newTempo))
      throw 'Invalid tempo';
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

  subscribe(callback: Banana.Subscription) {
    subscriptions.push(callback);
  },
  unsubscribe(callbackToRemove: Banana.Subscription) {
    subscriptions.some((subscription, index) => {
      if (callbackToRemove === subscription) {
        subscriptions.splice(index, 1);
        return true;
      }
    });
  },

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


  function publish(): void {
    subscriptions.forEach(callback => callback());
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
