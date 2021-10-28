interface AudioPlayer {
  play(): void
  pause(): void
}

declare interface AudioEvent {
  realTime: RealTime
  audioBuffer: AudioBuffer
}

declare interface AudioEventSource {
  getAudioEvents(interval:Interval): AudioEvent[]
}
