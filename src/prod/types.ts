export interface ILibrary {
  load(instrumentCollection:PackedInstrument[]): void
  instrumentMetas: InstrumentMeta[]
  getInstrument(id:string): Instrument
}

export interface InstrumentMeta {
  id: string // single digit or char, 0 is allowed
  displayOrder: number
  displayName: string
  colourGroup: string // blue, purple, green, orange, or yellow
  noteStyles?: {[id: string]: NoteStyleBase}
}

export interface PackedInstrument extends InstrumentMeta {
  packedNoteStyles: PackedNoteStyle[]
}

export interface Instrument extends InstrumentMeta, Subscribable {
  readonly loaded: boolean
  noteStyles: {[id: string]: NoteStyle}
}

export interface NoteStyleBase {
  id: string // single digit or char, can't be 0
  symbol: NoteStyleSymbol
  muting?: MutingRule|MutingRule[]
}

export interface PackedNoteStyle extends NoteStyleBase {
  file: string
}

export interface NoteStyle extends NoteStyleBase {
  audioBuffer: AudioBuffer|null // null while the instrument is loading
  instrument: Instrument
}

export interface NoteStyleSymbol {
  src?: string // path to use an img src
  string: string // string to display for this note-style
}

export type MutingRule = MutingRuleSimple | MutingRuleOtherInstrument

export interface MutingRuleOtherInstrument {
  name: 'otherInstrument'
  id: string
}

export type MutingRuleSimple = string;

export type Subscription = (...args:any[]) => void

export interface Subscribable {
  subscribe(callback:Subscription): void
  unsubscribe(callback:Subscription): void
}

export interface Publisher extends Subscribable {
  publish(): void
}

export interface Arrangement extends Subscribable {
  timeParams: TimeParams
  tracks: {[trackId:string]: Track}
  addTrack(instrument:Instrument): Track
  unpackTracks(packedTracks:PackedTrack[]): void
  removeTrack(track:Track): void
}

export interface PackedArrangement {
  timeParams: PackedTimeParams
  packedTracks: PackedTrack[]
}

export interface PackedTimeParams {
  timeSignature: string
  tempo: number
  length: number
  pulse: string
  stepResolution: number
}

export interface TimeParams extends PackedTimeParams, Subscribable {
  isValid(timing:Timing): boolean
  readonly timings: Timing[]
}

// steps are currently always sixteenths
// When we bring in polyrhythms that will change
// It may also change for other time signatures but I'm not sure yet
export type Timing = {readonly bar:number, readonly step:number}
export type RealTime = number

export interface Interval {
  start: RealTime
  end: RealTime
}

// Intervals may land beyond the end of a loop, but LoopIntervals must be within the loop
export interface LoopInterval extends Interval {
  loopNumber: number
}

export interface TimeCoordinator extends Subscribable {
  convertToRealTime(timing:Timing): RealTime
  convertToLoopIntervals(interval:Interval): LoopInterval[]
  convertToAudioTime(realTime:RealTime, loopNumber:number): RealTime
}

export interface Track extends Subscribable {
  id: string;
  arrangement: Arrangement
  instrument: Instrument
  notes: Note[] // Must be kept in order - this is Track's job
  getNoteAt(timing:Timing): Note
  colour: string // A specific hsl() string
  clear(): void
}

export interface PackedTrack {
  instrumentId: string
  packedNotes: PackedNote[]
}

export interface PackedNote {
  noteStyleId: string
  timing: PackedTiming
}

export type PackedTiming = `${number}:${number}` // bar:step
// We don't use "." because numbers might contain it

export interface Note extends Subscribable {
  id: string
  timing: Timing
  track: Track
  noteStyle: NoteStyle|null // null means this is a rest
}

export interface IEventEngine extends Subscribable {
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
  note: Note // In the future, this could be a more general "source" property
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
}

export interface AudioBufferPlayer {
  stop(): void
  onEnded: (callback:() => void) => void
}

export interface ArrangementPlayer extends EventSource, Subscribable {
  arrangement: Arrangement
  trackPlayers: {[trackId:string]:TrackPlayer}
  get currentTiming(): Timing
  currentTimingPublisher: Subscribable
  audibleTrackPlayers: {[trackId:string]:TrackPlayer}
  audibleTrackPlayersPublisher: Subscribable
}

export interface TrackPlayer extends EventSource, Subscribable {
  track: Track
  soloMute: SoloMute
}

export type SoloMute = null | 'solo' | 'mute'
