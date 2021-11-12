declare interface Track extends Publisher, AudioEventSource {
  arrangement: Arrangement
  instrument: Instrument
  edit(command: EditCommand): void
  getNoteAt(timing:Timing): Note
}

declare interface TrackBuilder {
  (arrangement:Arrangement, instrument:Instrument, packedNotes?:PackedNote[]): Track
  unpack(arrangement:Arrangement, packedTrack:PackedTrack): Track
}

declare interface PackedTrack {
  instrumentId: string
  packedNotes: PackedNote[]
}

declare interface PackedNote {
  noteStyleId: string
  timing: Timing
}

declare interface EditCommand {
  timing: Timing
  newValue: string|null // will be a noteStyleId or null for delete
}
