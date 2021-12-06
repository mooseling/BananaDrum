declare namespace Banana {
  interface Track extends Publisher {
    arrangement: Arrangement
    instrument: Instrument
    notes: Note[]
    edit(command: EditCommand): void
    getNoteAt(timing:Timing): Note
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
    timing: Timing
  }

  interface EditCommand {
    timing: Timing
    newValue: string|null // will be a noteStyleId or null for delete
  }
}
