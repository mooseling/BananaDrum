// Timings are in the format #.#.#(.#)
// Which is bars.beats.sixteenths(.sixtyfourths)
// I refer to a each # as a bit, or timing-bit
// Bits are integers
// Bits can be modified by appending 'T' or 'TT' to indicate triplets

// I tried to enforce the above using unions of primitive types
// The error messages then enumerated all possbible string formats
// And this was way too annoying and noisy

declare type Timing = string
declare type RealTime = number

declare interface Interval {
  start: RealTime
  end: RealTime
}

// Intervals may land beyond the end of a loop, but LoopIntervals must be within the loop
declare interface LoopInterval extends Interval {
  loopNumber: number
}


declare type TimeCoordinatorBuilder = (timeParams:TimeParams) => TimeCoordinator
declare interface TimeCoordinator extends Publisher {
  convertToRealTime(timing:Timing): RealTime
  convertToLoopIntervals(interval:Interval): LoopInterval[]
  convertToAudioTime(realTime:RealTime, loopNumber:number): RealTime
}
