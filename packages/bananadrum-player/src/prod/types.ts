import { ArrangementView, BananaDrum, NoteView, RealTime, Subscribable, Timing, TrackView } from 'bananadrum-core'

export interface BananaDrumPlayer {
  bananaDrum: BananaDrum
  eventEngine: EventEngine
  arrangementPlayer: ArrangementPlayer
}

export interface EventEngine extends Subscribable {
  connect(eventSource:EventSource): void
  play(): void
  stop(): void
  getTime(): RealTime
  state: EventEngineState
}

export type EventEngineState = 'stopped'|'playing'

export interface EventDetails {
  realTime: RealTime
}

export interface AudioEvent extends EventDetails {
  audioBuffer: AudioBuffer
  note: NoteView // In the future, this could be a more general "source" property
}

export interface CallbackEvent extends EventDetails {
  callback(): void
}

export type MuteFilter = (audioEvent:AudioEvent) => boolean
export interface MuteEvent extends EventDetails {
  muteFilter: MuteFilter
}

export type Event = CallbackEvent|AudioEvent|MuteEvent

export interface EventSource {
  getEvents(interval:Interval): Event[]
  onStop?:() => void
}

export interface ArrangementPlayer extends EventSource, Subscribable {
  arrangement: ArrangementView
  trackPlayers: Map<TrackView, TrackPlayer>
  get currentTiming(): Timing
  currentTimingPublisher: Subscribable
  convertToLoopProgress(realTime:RealTime): number
  audibleTrackPlayers: Map<TrackView, TrackPlayer>
  audibleTrackPlayersPublisher: Subscribable
}

export interface TrackPlayer extends EventSource, Subscribable {
  track: TrackView
  soloMute: SoloMute
  currentPolyrhythmNotePublisher: Subscribable
  readonly currentPolyrhythmNote: NoteView|null
}

export type SoloMute = null | 'solo' | 'mute'

export interface Interval {
  start: RealTime
  end: RealTime
}

// Intervals may land beyond the end of a loop, but LoopIntervals must be within the loop
export interface LoopInterval extends Interval {
  loopNumber: number
}

export interface TimeCoordinator extends Subscribable {
  readonly realTimeLength: RealTime
  convertToRealTime(timing:Timing): RealTime
  convertToLoopIntervals(interval:Interval): LoopInterval[]
  convertToAudioTime(realTime:RealTime, loopNumber:number): RealTime
  convertToLoopProgress(realTime:RealTime): number //  distance through loop from 0 to 1
}
