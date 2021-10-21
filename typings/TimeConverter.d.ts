declare interface TimeConverter {
  convertToRealTime(timing:Timing): RealTime,
  getLoopAdjustedIntervals(interval:Interval): AdjustedInterval[],
  getLoopAdjustedRealTime(realTime:RealTime, loopNumber:number): RealTime
}

declare interface Interval {
  start: RealTime
  end: RealTime
}

declare interface AdjustedInterval extends Interval {
  loopNumber: number
}
