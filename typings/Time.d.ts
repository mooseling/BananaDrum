declare namespace Banana {
  // Timings are in the format #.#.#(.#)
  // Which is bars.beats.sixteenths(.sixtyfourths)
  // I refer to a each # as a bit, or timing-bit
  // Bits are integers
  // Bits can be modified by appending 'T' or 'TT' to indicate triplets

  // I tried to enforce the above using unions of primitive types
  // The error messages then enumerated all possbible string formats
  // And this was way too annoying and noisy

  type Timing = string
  type RealTime = number

  interface Interval {
    start: RealTime
    end: RealTime
  }

  // Intervals may land beyond the end of a loop, but LoopIntervals must be within the loop
  interface LoopInterval extends Interval {
    loopNumber: number
  }


  type TimeCoordinatorBuilder = (timeParams:TimeParams) => TimeCoordinator
  interface TimeCoordinator extends Subscribable {
    convertToRealTime(timing:Timing): RealTime
    convertToLoopIntervals(interval:Interval): LoopInterval[]
    convertToAudioTime(realTime:RealTime, loopNumber:number): RealTime
  }
}
