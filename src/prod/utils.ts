// Comparing timings is easy, but long winded and mistake-prone
export function isSameTiming(timing1:Banana.Timing, timing2:Banana.Timing): boolean {
  return (timing1.bar === timing2.bar) && (timing1.step === timing2.step);
}


export function exists<T>(value: T | undefined | null): value is T {
  return value === (value ?? !value);
}
