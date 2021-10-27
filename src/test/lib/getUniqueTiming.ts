// This is just going to sequentially return timings
// 1, 1.1, 1.2, 1.3, 1.4, 2, 2.1, ...
export const getUniqueTiming: () => Timing = (function(){
  let lastTiming: null|Timing = null;

  return () => {
    let newTiming: Timing = lastTiming === null ? '1' : getNewTiming(lastTiming);
    lastTiming = newTiming;
    return newTiming;
  }
})();

function getNewTiming(lastTiming:Timing): Timing {
  const lastTimingBits = lastTiming.split('.').map(bit => Number(bit));
  const [bars, beats = 1] = lastTimingBits;
  if (beats === 4)
    return `${bars + 1}`;
  else
    return `${bars}.${beats + 1}`;
}
