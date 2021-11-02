declare interface Offsetter {
  getTime(time:RealTime): RealTime
  getInterval(interval:Interval): Interval
  unoffset(time:RealTime): RealTime
  update(tempo:number, audioTime:RealTime):void
}

declare interface OffsetterBuilder {
  (tempo: number): Offsetter
}
