// This is just going to sequentially return timings
// 1, 1.1, 1.2, 1.3, 1.4, 2, 2.1, ...
export const getUniqueTiming: () => Banana.Timing = (function(){
  let lastTiming: null|Banana.Timing = null;

  return () => {
    let newTiming: Banana.Timing = lastTiming === null ? '1.1.1' : getNewTiming(lastTiming);
    lastTiming = newTiming;
    return newTiming;
  }
})();

function getNewTiming(lastTiming:Banana.Timing): Banana.Timing {
  const lastTimingBits = lastTiming.split('.').map(bit => Number(bit));
  const [bars, beats = 1] = lastTimingBits;
  if (beats === 4)
    return `${bars + 1}.1.1`;
  else
    return `${bars}.${beats + 1}.1`;
}
