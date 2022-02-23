declare namespace Banana {
  interface Track {
    arrangement: Arrangement
    instrument: Instrument
    notes: Note[]
    getNoteAt(timing:Timing): Note
    colour: string // A specific hsl() string
  }

  interface TrackBuilder {
    (arrangement:Arrangement, instrument:Instrument, packedNotes?:PackedNote[]): Track
    unpack(arrangement:Arrangement, packedTrack:PackedTrack): Promise<Track>
  }

  interface PackedTrack {
    instrumentId: string
    packedNotes: PackedNote[]
  }

  interface PackedNote {
    noteStyleId: string
    timing: Timing
  }
}
