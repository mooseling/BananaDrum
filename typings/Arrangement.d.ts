declare namespace Banana {
  interface ArrangementBuilder {
    (library:Library, packedArrangement?:PackedArrangement): Arrangement
  }

  interface Arrangement extends Publisher {
    timeParams: TimeParams
    library: Library
    tracks: {[trackId:string]: Track}
    addTrack(track:Track): void
    getSixteenths(): Timing[]
  }

  interface PackedArrangement {
    timeParams: PackedTimeParams
    packedTracks: PackedTrack[]
  }
}
