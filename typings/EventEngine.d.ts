declare namespace Banana {
  interface EventEngine extends Subscribable {
    initialise(): void
    connect(eventSource:EventSource): void
    play(): void
    pause(): void
    getTime(): RealTime
    playSound(audioBuffer:AudioBuffer, time?:number): AudioBufferSourceNode
    state: EventEngineState
  }

  type EventEngineState = 'stopped'|'playing'|'paused'

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

  type MuteFilter = (audioEvent:AudioEvent) => boolean
  interface MuteEvent extends EventDetails {
    muteFilter: MuteFilter
  }

  type Event = CallbackEvent|AudioEvent|MuteEvent

  interface EventSource {
    getEvents(interval:Interval): Event[]
  }

  interface AudioBufferPlayer {
    stop(): void
    onEnded: (callback:() => void) => void
  }
}
