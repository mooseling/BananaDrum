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
  }

  interface PackedInstrument extends InstrumentMeta {
    packedNoteStyles: PackedNoteStyle[]
  }

  interface PackedNoteStyle {
    noteStyleId: string
    file: string
  }

  interface Instrument extends InstrumentMeta {
    noteStyles: {[styleId: string]: NoteStyle}
  }

  interface NoteStyle {
    noteStyleId: string
    audioBuffer: AudioBuffer
  }
}
