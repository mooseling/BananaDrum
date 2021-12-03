declare interface EventEngine {
  initialise(): void
  connect(eventSource:AudioEventSource|CallbackEventSource): void
  play(): void
  pause(): void
  getTime(): RealTime
}

declare interface EventDetails {
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
