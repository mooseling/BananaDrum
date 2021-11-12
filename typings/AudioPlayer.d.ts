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
}

declare interface AudioEventSource {
  getAudioEvents(interval:Interval): AudioEvent[]
}
