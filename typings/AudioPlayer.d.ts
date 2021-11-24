declare interface AudioPlayer {
  initialise(): void
  connect(eventSource:AudioEventSource|CallbackEventSource): void
  play(): void
  pause(): void
  getTime(): RealTime
}

declare interface EventDetails {
  // identifier: So that AudioPlayer doesn't double play notes
  // AudioEventSources create identifiers that are unique within themselves
  // AudioEventSources passing them on should extend on the right, starting with "--"
  identifier: string
  realTime: RealTime
}

declare interface AudioEvent extends EventDetails {
  audioBuffer: AudioBuffer
  note: Note // In the future, this could be a more general "source" property
}

declare interface CallbackEvent extends EventDetails {
  callback(): void
}

declare interface AudioEventSource {
  getAudioEvents(interval:Interval): AudioEvent[]
}

declare interface CallbackEventSource {
  getCallbackEvents(interval:Interval): CallbackEvent[]
}
