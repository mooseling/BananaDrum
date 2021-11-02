function OffsetterBuilder(tempo:number): Offsetter {
  let offset = 0;

  return {getTime, getInterval, update};


  function getTime(time:number): RealTime {
    return time + offset;
  }

  function getInterval({start, end}:Interval): Interval {
    return {
      start: start + offset,
      end: end + offset
    };
  }

  function update(newTempo: number, audioTime:RealTime) {
    const oldTempo = tempo;
    const oldTime = audioTime + offset;
    const newTime = oldTime * (oldTempo / newTempo);
    offset = newTime - audioTime;
    tempo = newTempo;
  }
}

export const Offsetter:OffsetterBuilder = OffsetterBuilder;
