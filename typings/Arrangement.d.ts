declare namespace Banana {
  interface ArrangementBuilder {
    (packedArrangement?:PackedArrangement): Promise<Arrangement>
  }

  interface Arrangement extends Publisher {
    timeParams: TimeParams
    tracks: {[trackId:string]: Track}
    addTrack(track:Track): void
    getSixteenths(): Timing[]
  }

  interface PackedArrangement {
    timeParams: PackedTimeParams
    packedTracks: PackedTrack[]
  }
}
