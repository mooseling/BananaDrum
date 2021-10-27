declare interface ArrangementBuilder {
  (library:Library, packedArrangement?:PackedArrangement): Arrangement
}

declare interface ArrangementDetails {
  timeSignature: string
  tempo: number
  length: number
}

declare interface Arrangement extends ArrangementDetails {
  tracks: Track[]
  getSixteenthCount(): number
}

declare interface PackedArrangement extends ArrangementDetails {
  packedTracks: PackedTrack[]
}
