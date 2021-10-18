declare interface Note {
  timing: string,
  instrumentId: string,
  styleId: string
}

declare interface PlayableNote {
  realTime: number,
  note: Note,
  loopsPlayed: number[]
}

declare interface NoteSource {
  library:Library,
  getPlayableNotes(intervalStart: number, intervalEnd: number): PlayableNote[]
}

declare interface Track {
  notes: Note[]
}

declare interface ArrangementDetails {
  timeSignature: string,
  tempo: number,
  length: number
}

declare interface Arrangement extends ArrangementDetails {
  tracks: Track[]
}

declare interface AdjustedInterval {
  loopNumber: number,
  intervalStart: number,
  intervalEnd: number
}

declare interface TimeConverter {
  convertToRealTime(timing:string): number,
  getLoopAdjustedIntervals(intervalStart:number, intervalEnd:number): AdjustedInterval[],
  getLoopAdjustedRealTime(realTime:number, loopNumber:number): number
}

declare interface NoteStyle {
  file: string,
  audio?: ArrayBuffer
}

declare interface NoteStyleSet {
  [styleId: string]: NoteStyle
}

declare interface Instrument {
  displayName: string,
  noteStyles: NoteStyleSet
}

declare interface InstrumentCollection {
  [instrumentId: string]: Instrument
}

declare interface Library {
  load(libraryToLoad:InstrumentCollection): Promise<void>,
  getAudio(instrumentId:string, styleId:string): ArrayBuffer
}

declare interface AudioGetter {
  get(filename: string): Promise<ArrayBuffer>
}
