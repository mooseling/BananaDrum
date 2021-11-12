declare interface ArrangementBuilder {
  (library:Library, packedArrangement?:PackedArrangement): Arrangement
}

declare interface Arrangement extends AudioEventSource {
  timeParams: TimeParams
  library: Library
  tracks: Track[]
  getSixteenths(): Timing[]
}

declare interface PackedArrangement {
  timeParams: PackedTimeParams
  packedTracks: PackedTrack[]
}
