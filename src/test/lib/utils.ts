export function closeEnough(value1:number, value2:number, threshold = 0.00000001): boolean {
  return Math.abs(value1 - value2) < threshold;
}

type TimingLike = {bar:number, step:number, score?:number}
export function timingToString(timing:TimingLike): string {
  if (timing.score !== undefined)
    return `${timing.bar}.${timing.step}@${timing.score}`;
  return `${timing.bar}.${timing.step}`;
}


export function isSameApproxTiming(t1:Banana.ApproxTiming, t2:Banana.ApproxTiming): boolean {
  return (t1.bar === t2.bar) && (t1.step === t2.step) && closeEnough(t1.score, t2.score);
}
