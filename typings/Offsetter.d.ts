declare interface Offsetter {
  getTime(time:RealTime): number
  getInterval(interval:Interval): Interval
  update(tempo:number, audioTime:RealTime):void
}

declare interface OffsetterBuilder {
  (tempo: number): Offsetter
}
