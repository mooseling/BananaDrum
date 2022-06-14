declare namespace Banana {
  type ArrangementPlayerBuilder = (arrangement:Arrangement) => ArrangementPlayer
  interface ArrangementPlayer extends EventSource, Subscribable {
    arrangement: Arrangement
    get currentTiming(): Timing
  }

  type TrackPlayerBuilder = (track:Track, timeCoordinator:TimeCoordinator) => TrackPlayer
  interface TrackPlayer extends EventSource {
    track: Track
  }
}
