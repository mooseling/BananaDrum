declare namespace Banana {
  type ArrangementPlayerBuilder = (arrangement:Arrangement) => ArrangementPlayer
  interface ArrangementPlayer extends EventSource, Subscribable {
    arrangement: Arrangement
    trackPlayers: {[trackId:string]:Banana.TrackPlayer}
    get currentTiming(): Timing
    currentTimingPublisher: Subscribable
  }

  type TrackPlayerBuilder = (track:Track, timeCoordinator:TimeCoordinator) => TrackPlayer
  interface TrackPlayer extends EventSource, Subscribable {
    track: Track
    soloMute: SoloMute
  }

  type SoloMute = null | 'solo' | 'mute'
}
