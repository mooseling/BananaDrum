declare namespace Banana {
  interface EventEngine extends Subscribable {
    initialise(): void
    connect(eventSource:EventSource): void
    play(): void
    pause(): void
    getTime(): RealTime
    playSound(audioBuffer:AudioBuffer, time?:number): AudioBufferSourceNode
    state: 'stopped'|'playing'|'paused'
  }

  interface EventDetails {
    realTime: RealTime
  }

  interface AudioEvent extends EventDetails {
    audioBuffer: AudioBuffer
    note: Note // In the future, this could be a more general "source" property
  }

  interface CallbackEvent extends EventDetails {
    callback(): void
  }

  type Event = CallbackEvent|AudioEvent

  interface EventSource {
    getEvents(interval:Interval): (Event)[]
  }
}
