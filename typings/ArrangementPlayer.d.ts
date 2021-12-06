
declare type ArrangementPlayerBuilder = (arrangement:Arrangement) => ArrangementPlayer
declare interface ArrangementPlayer extends Banana.EventSource, Publisher {
  loop(turnLoopingOn?:boolean): void
  get currentTiming(): Timing
}

declare type TrackPlayer = Banana.EventSource
declare type TrackPlayerBuilder = (track:Track, timeCoordinator:TimeCoordinator) => TrackPlayer
