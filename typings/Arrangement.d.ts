declare namespace Banana {
  interface ArrangementBuilder {
    (library:Library, packedArrangement?:PackedArrangement): Arrangement
  }

  interface Arrangement {
    timeParams: TimeParams
    library: Library
    tracks: {[trackId:string]: Track}
    getSixteenths(): Timing[]
  }

  interface PackedArrangement {
    timeParams: PackedTimeParams
    packedTracks: PackedTrack[]
  }
}
