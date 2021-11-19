
declare type ArrangementPlayerBuilder = (arrangement:Arrangement) => ArrangementPlayer
declare interface ArrangementPlayer extends AudioEventSource {
  loop(turnLoopingOn?:boolean): void
}

declare type TrackPlayer = AudioEventSource
declare type TrackPlayerBuilder = (track:Track) => TrackPlayer
