
declare type ArrangementPlayerBuilder = (arrangement:Arrangement) => ArrangementPlayer
declare interface ArrangementPlayer extends AudioEventSource, CallbackEventSource, Publisher {
  loop(turnLoopingOn?:boolean): void
  get currentTiming(): Timing
}

declare type TrackPlayer = AudioEventSource
declare type TrackPlayerBuilder = (track:Track, timeCoordinator:TimeCoordinator) => TrackPlayer
