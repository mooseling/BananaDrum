declare namespace Banana {
  interface Library {
    load(): Promise<void>
    instruments: {[instrumentId:string]: Instrument}
  }

  type InstrumentCollection = PackedInstrument[]

  interface PackedInstrument {
    instrumentId: string
    displayName: string
    packedNoteStyles: PackedNoteStyle[]
  }

  interface PackedNoteStyle {
    noteStyleId: string
    file: string
  }

  interface Instrument {
    instrumentId: string
    displayName: string
    noteStyles: {[styleId: string]: NoteStyle}
  }

  interface NoteStyle {
    noteStyleId: string
    audioBuffer: AudioBuffer
  }
}
