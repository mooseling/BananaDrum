declare interface ArrangementBuilder {
  (library:Library, packedArrangement?:PackedArrangement): Arrangement
}

declare interface TimeParams {
  timeSignature: string
  tempo: number
  length: number
}

declare interface Arrangement {
  timeParams: TimeParams
  library: Library
  tracks: Track[]
  getSixteenths(): Timing[]
}

declare interface PackedArrangement {
  timeParams: TimeParams
  packedTracks: PackedTrack[]
}
