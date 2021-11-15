declare interface AudioPlayerBuilder {
  (audioEventSource:AudioEventSource): AudioPlayer
}

declare interface AudioPlayer {
  play(): void
  pause(): void
  getTime(): RealTime
}

declare interface AudioEvent {
  // identifier: So that AudioPlayer doesn't double play notes
  // AudioEventSources create identifiers that are unique within themselves
  // AudioEventSources passing them on should extend on the right, starting with "--"
  identifier: string

  realTime: RealTime
  audioBuffer: AudioBuffer
  note: Note // In the future, this could be a more general "source" property
}

declare interface AudioEventSource {
  getAudioEvents(interval:Interval): AudioEvent[]
}
