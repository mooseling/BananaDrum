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
