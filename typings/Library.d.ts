declare interface Library {
  load(): Promise<void>
  instruments: {[instrumentId:string]: Instrument}
}

declare type InstrumentCollection = PackedInstrument[]

declare interface PackedInstrument {
  instrumentId: string
  displayName: string
  packedNoteStyles: PackedNoteStyle[]
}

declare interface PackedNoteStyle {
  noteStyleId: string
  file: string
}

declare interface Instrument {
  instrumentId: string
  displayName: string
  noteStyles: {[styleId: string]: NoteStyle}
}

declare interface NoteStyle {
  noteStyleId: string
  audioBuffer: AudioBuffer
}
