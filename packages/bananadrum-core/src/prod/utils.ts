import { Timing } from "./types/general.js";

// Comparing timings is easy, but long winded and mistake-prone
export function isSameTiming(timing1:Timing, timing2:Timing): boolean {
  return (timing1.bar === timing2.bar) && (timing1.step === timing2.step);
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
