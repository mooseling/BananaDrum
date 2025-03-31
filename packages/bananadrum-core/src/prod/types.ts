export interface BananaDrum {
  library: Library
  arrangement: ArrangementView
}

export interface Library {
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

export type Subscription = (...args:unknown[]) => void

export interface Subscribable {
  subscribe(callback:Subscription): void
  unsubscribe(callback:Subscription): void
}

export interface Publisher extends Subscribable {
  publish(): void
}

export interface ArrangementView extends Subscribable {
  readonly title: string
  timeParams: TimeParamsView
  tracks: TrackView[]
}

export interface Arrangement extends ArrangementView {
  title: string
  tracks: Track[]
  addTrack(instrument:Instrument): Track
  removeTrack(track:Track): void
}

export interface TimeParamsView extends Subscribable {
  readonly timeSignature: string
  readonly tempo: number
  readonly length: number
  readonly pulse: string
  readonly stepResolution: number
  isValid(timing:Timing): boolean
  readonly timings: Timing[]

}

export interface TimeParams extends TimeParamsView {
  timeSignature: string
  tempo: number
  length: number
  pulse: string
  stepResolution: number
}

// steps are currently always sixteenths
// When we bring in polyrhythms that will change
// It may also change for other time signatures but I'm not sure yet
export type Timing = {readonly bar:number, readonly step:number}
export type RealTime = number

export interface TrackView extends Subscribable {
  id: string;
  arrangement: ArrangementView
  instrument: Instrument
  notes: NoteView[] // Must be kept in order - this is Track's job
  polyrhythms: Polyrhythm[]
  colour: string // A specific hsl() string
  getNoteAt(timing:Timing): NoteView
  getNoteIterator(polyrhythmsToIgnore?:Polyrhythm[]): IterableIterator<NoteView>
}

export interface Track extends TrackView {
  arrangement: Arrangement
  notes: Note[]
  getNoteAt(timing:Timing): Note
  getNoteIterator(polyrhythmsToIgnore?:Polyrhythm[]): IterableIterator<Note>
  addPolyrhythm(start:Note, end:Note, length:number): void
  removePolyrhythm(polyrhythm:Polyrhythm): void
  clear(): void
}

// Or should the note point to the polyrhythm? That's somewhat easier...
export interface Polyrhythm {
  id: string
  start: Note
  end: Note
  notes: Note[]
}

export interface NoteView extends Subscribable {
  id: string
  timing: Timing
  track: TrackView
  polyrhythm: Polyrhythm
  readonly noteStyle: NoteStyle|null // null means this is a rest
}

export interface Note extends NoteView {
  readonly track: Track
  noteStyle: NoteStyle|null // null means this is a rest
}
