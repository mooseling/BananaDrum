declare interface TimeConverter {
  convertToRealTime(timing:Timing): RealTime
  getLoopRealTime(realTime:RealTime, loopNumber:number): RealTime
  getLoopIntervals(interval:Interval): LoopInterval[]
}

declare interface Interval {
  start: RealTime
  end: RealTime
}

declare interface LoopInterval extends Interval {
  loopNumber: number
}
