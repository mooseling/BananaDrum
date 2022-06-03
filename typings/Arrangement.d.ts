declare namespace Banana {
  interface ArrangementBuilder {
    (timeParams:TimeParams): Arrangement
    unpack(packedArrangement:PackedArrangement): Promise<Arrangement>
  }

  interface Arrangement extends Subscribable {
    timeParams: TimeParams
    tracks: {[trackId:string]: PotentialTrack}
    createTrack(instrument:Instrument|Promise<Instrument>): Promise<Track|void>
    unpackTracks(packedTracks:PackedTrack[]): Promise<void>
    removeTrack(track:Track): void
  }

  interface PackedArrangement {
    timeParams: PackedTimeParams
    packedTracks: PackedTrack[]
  }
}
