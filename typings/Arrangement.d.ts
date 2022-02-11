declare namespace Banana {
  interface ArrangementBuilder {
    (timeParams:TimeParams): Arrangement
    unpack(packedArrangement:PackedArrangement): Promise<Arrangement>
  }

  interface Arrangement extends Subscribable {
    timeParams: TimeParams
    tracks: {[trackId:string]: Track}
    createTrack(instrument:Instrument): void
    unpackTracks(packedTracks:PackedTrack[]): Promise<void>
    removeTrack(track:Track): void
    getSixteenths(): Timing[]
  }

  interface PackedArrangement {
    timeParams: PackedTimeParams
    packedTracks: PackedTrack[]
  }
}
