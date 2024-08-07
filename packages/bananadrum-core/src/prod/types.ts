export interface BananaDrum {
  library: Library
  arrangement: Arrangement
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

export interface Arrangement extends Subscribable {
  title: string
  timeParams: TimeParams
  tracks: Track[]
  addTrack(instrument:Instrument): Track
  removeTrack(track:Track): void
}

export interface TimeParams extends Subscribable {
  timeSignature: string
  tempo: number
  length: number
  pulse: string
  stepResolution: number
  isValid(timing:Timing): boolean
  readonly timings: Timing[]
}

// steps are currently always sixteenths
// When we bring in polyrhythms that will change
// It may also change for other time signatures but I'm not sure yet
export type Timing = {readonly bar:number, readonly step:number}
export type RealTime = number

export interface Track extends Subscribable {
  id: string;
  arrangement: Arrangement
  instrument: Instrument
  notes: Note[] // Must be kept in order - this is Track's job
  polyrhythms: Polyrhythm[]
  addPolyrhythm(start:Note, end:Note, length:number): void
  removePolyrhythm(polyrhythm:Polyrhythm): void
  getNoteAt(timing:Timing): Note
  colour: string // A specific hsl() string
  clear(): void
  getNoteIterator(polyrhythmsToIgnore?:Polyrhythm[]): IterableIterator<Note>
}

// Or should the note point to the polyrhythm? That's somewhat easier...
export interface Polyrhythm {
  id: string
  start: Note
  end: Note
  notes: Note[]
}

export interface Note extends Subscribable {
  id: string
  timing: Timing
  track: Track
  polyrhythm:Polyrhythm
  noteStyle: NoteStyle|null // null means this is a rest
}
