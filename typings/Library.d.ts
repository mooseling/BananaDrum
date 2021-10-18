declare interface Library {
  load(libraryToLoad:InstrumentCollection): Promise<void>,
  getAudio(instrumentId:string, styleId:string): ArrayBuffer
}

declare interface InstrumentCollection {
  [instrumentId: string]: Instrument
}

declare interface Instrument {
  displayName: string,
  noteStyles: NoteStyleSet
}

declare interface NoteStyleSet {
  [styleId: string]: NoteStyle
}

declare interface NoteStyle {
  file: string,
  audio?: ArrayBuffer
}
