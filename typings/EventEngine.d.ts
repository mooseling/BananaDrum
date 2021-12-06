declare interface EventEngine {
  initialise(): void
  connect(eventSource:Banana.EventSource): void
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

declare namespace Banana {
  type Event = CallbackEvent|AudioEvent

  interface EventSource {
    getEvents(interval:Interval): (Event)[]
  }
}
