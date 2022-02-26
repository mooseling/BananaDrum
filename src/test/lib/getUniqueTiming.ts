// This is just going to sequentially return timings
// 1:1, 1:2, ..., 1:16, 2:1, 2:2, ...
export const getUniqueTiming: () => Banana.Timing = (function(){
  let lastTiming: null|Banana.Timing = null;

  return () => {
    let newTiming:Banana.Timing = getNewTiming(lastTiming);
    lastTiming = newTiming;
    return newTiming;
  }
})();

function getNewTiming(lastTiming:Banana.Timing): Banana.Timing {
  if (lastTiming === null)
    return {bar:1, step:1};
  const {bar, step} = lastTiming;
  if (step === 16)
    return {bar:bar + 1, step:1}
  else
    return {bar, step:step + 1};
}
