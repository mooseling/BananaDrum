declare namespace Banana {
  // steps are currently always sixteenths
  // When we bring in polyrhythms that will change
  // It may also change for other time signatures but I'm not sure yet
  type Timing = {readonly bar:number, readonly step:number}
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
