declare interface TimeConverter {
  convertToRealTime(timing:string): number,
  getLoopAdjustedIntervals(intervalStart:number, intervalEnd:number): AdjustedInterval[],
  getLoopAdjustedRealTime(realTime:number, loopNumber:number): number
}

declare interface AdjustedInterval {
  loopNumber: number,
  intervalStart: number,
  intervalEnd: number
}
