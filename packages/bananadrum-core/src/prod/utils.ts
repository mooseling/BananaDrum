import { Timing, TimingDelta } from "./types/general.js";

// Comparing timings is easy, but long winded and mistake-prone
export function isSameTiming(timing1:Timing, timing2:Timing): boolean {
  return (timing1.bar === timing2.bar) && (timing1.step === timing2.step);
}

export function subtractTimings(minuend: Timing, subtrahend: Timing): TimingDelta {
  return { bars: minuend.bar - subtrahend.bar, steps: minuend.step - subtrahend.step };
}

export function addDelta(timing: Timing, delta: TimingDelta): Timing {
  return { bar: timing.bar + delta.bars, step: timing.step + delta.steps };
}

export function isTimingLessThanOrEqual(a: Timing, b: Timing): boolean {
  return a.bar < b.bar || (a.bar === b.bar && a.step <= b.step);
}

export function isIntervalWithinLimits(intervalStart: Timing, intervalEnd: Timing, lowerLimit: Timing, upperLimit: Timing): boolean {
    return isTimingLessThanOrEqual(lowerLimit, intervalStart) && isTimingLessThanOrEqual(intervalEnd, upperLimit);
}


// Returns false for null, undefined
export function exists<T>(value: T | undefined | null): value is T {
  return value === (value ?? !value);
}


export function rangeArray<T>(itemCount: number, mapIndexToItem: (number)=>T): T[] {
  return Array.from(Array(itemCount)).map((_, index) => mapIndexToItem(index));
}


let id = 0;
export function getNewId(): number {
  id++;
  return id;
}


export function calculateStepsPerBar(timeSignature:string, stepResolution:number): number {
  const [beatsPerBar, beatNoteValue] = timeSignature.split('/').map((value: string) => Number(value));
  const stepsPerBeat = stepResolution / beatNoteValue;
  return stepsPerBeat * beatsPerBar;
}
