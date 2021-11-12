declare interface AudioPlayerBuilder {
  (audioEventSource:AudioEventSource): AudioPlayer
}

declare interface AudioPlayer {
  play(): void
  pause(): void
  getTime(): RealTime
}

declare interface AudioEvent {
  realTime: RealTime
  audioBuffer: AudioBuffer
  note: Note // In the future, this could be a more general "source" property
}

declare interface AudioEventSource {
  getAudioEvents(interval:Interval): AudioEvent[]
}
