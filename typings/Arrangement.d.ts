declare interface ArrangementBuilder {
  (library:Library, packedArrangement?:PackedArrangement): Arrangement
}

declare interface ArrangementDetails {
  timeSignature: string,
  tempo: number,
  length: number
}

declare interface Track {
  instrument: Instrument
  notes: Note[]
}

declare interface Arrangement extends ArrangementDetails {
  tracks: Track[]
}

declare interface PackedArrangement extends ArrangementDetails {
  packedTracks: PackedTrack[]
}

declare interface PackedTrack {
  instrumentId: string
  packedNotes: PackedNote[]
}

declare interface PackedNote {
  noteStyleId: string
  timing: Timing
}
