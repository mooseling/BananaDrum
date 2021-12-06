declare namespace Banana {
  type ArrangementPlayerBuilder = (arrangement:Arrangement) => ArrangementPlayer
  interface ArrangementPlayer extends EventSource, Publisher {
    loop(turnLoopingOn?:boolean): void
    get currentTiming(): Timing
  }

  type TrackPlayer = EventSource
  type TrackPlayerBuilder = (track:Track, timeCoordinator:TimeCoordinator) => TrackPlayer
}
