declare namespace Banana {
  interface Library {
    load(instrumentCollection:InstrumentCollection): void
    instrumentMetas: InstrumentMeta[]
    getInstrument(id:string): Instrument
  }

  type InstrumentCollection = PackedInstrument[]

  interface InstrumentMeta {
    id: string // single digit or char, 0 is allowed
    displayName: string
    colourGroup: string // blue, purple, green, orange, or yellow
    noteStyles?: {[id: string]: NoteStyleBase}
  }

  interface PackedInstrument extends InstrumentMeta {
    packedNoteStyles: PackedNoteStyle[]
  }

  interface Instrument extends InstrumentMeta, Subscribable {
    readonly loaded: boolean
    noteStyles: {[id: string]: NoteStyle}
  }

  interface NoteStyleBase {
    id: string // single digit or char, can't be 0
    symbol: NoteStyleSymbol
  }

  interface PackedNoteStyle extends NoteStyleBase {
    file: string
  }

  interface NoteStyle extends NoteStyleBase {
    audioBuffer: AudioBuffer|null // null while the instrument is loading
  }

  interface NoteStyleSymbol {
    src?: string // path to use an img src
    string: string // string to display for this note-style
  }
}
