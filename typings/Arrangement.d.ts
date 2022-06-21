declare namespace Banana {
  interface ArrangementBuilder {
    (timeParams:TimeParams): Arrangement
    unpack(packedArrangement:PackedArrangement): Arrangement
  }

  interface Arrangement extends Subscribable {
    timeParams: TimeParams
    tracks: {[trackId:string]: Track}
    createTrack(instrument:Instrument): Track
    unpackTracks(packedTracks:PackedTrack[]): void
    removeTrack(track:Track): void
  }

  interface PackedArrangement {
    timeParams: PackedTimeParams
    packedTracks: PackedTrack[]
  }
}
