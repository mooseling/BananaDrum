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
    if (newLength !== length) {
      length = newLength;
      publish();
    }
  },
  subscribe(callback: (...args:any[]) => void) {
    subscribers.push(callback);
  }
}


  function publish(): void {
    subscribers.forEach(callback => callback());
  }
}
