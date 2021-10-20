declare interface TimeConverter {
  convertToRealTime(timing:string): number,
  getLoopAdjustedIntervals(interval:Interval): AdjustedInterval[],
  getLoopAdjustedRealTime(realTime:number, loopNumber:number): number
}

declare interface Interval {
  start: number,
  end: number
}

declare interface AdjustedInterval extends Interval {
  loopNumber: number
}
