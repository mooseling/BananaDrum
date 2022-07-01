declare namespace Banana {
  interface Track extends Subscribable {
    id: string;
    arrangement: Arrangement
    instrument: Instrument
    notes: Note[] // Must be kept in order - this is Track's job
    getNoteAt(timing:Timing): Note
    colour: string // A specific hsl() string
  }

  interface TrackBuilder {
    (arrangement:Arrangement, instrument:Instrument, packedNotes?:PackedNote[]): Track
    unpack(arrangement:Arrangement, packedTrack:PackedTrack): Track
  }

  interface PackedTrack {
    instrumentId: string
    packedNotes: PackedNote[]
  }

  interface PackedNote {
    noteStyleId: string
    timing: PackedTiming
  }

  type PackedTiming = `${number}:${number}` // bar:step
  // We don't use "." because numbers might contain it
}
