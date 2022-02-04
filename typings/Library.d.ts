declare namespace Banana {
  interface Library {
    load(instrumentCollection:InstrumentCollection): void
    instrumentMetas: InstrumentMeta[]
    getInstrument(instrumentId:string): Promise<Instrument>
  }

  type InstrumentCollection = PackedInstrument[]

  interface InstrumentMeta {
    instrumentId: string
    displayName: string
    colourGroup: string // blue, purple, green, orange, or yellow
  }

  interface PackedInstrument extends InstrumentMeta {
    packedNoteStyles: PackedNoteStyle[]
  }

  interface PackedNoteStyle {
    noteStyleId: string
    file: string
    symbol?: NoteStyleSymbol
  }

  interface Instrument extends InstrumentMeta {
    noteStyles: {[styleId: string]: NoteStyle}
  }

  interface NoteStyle {
    noteStyleId: string
    audioBuffer: AudioBuffer
    symbol?: NoteStyleSymbol
  }

  interface NoteStyleSymbol {
    src?: string // path to use an img src
    string?: string // string to display for this note-style
  }
}
