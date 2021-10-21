declare interface Track {
  instrument: Instrument
  notes: Note[]
  edit(command: EditCommand): void
  subscribe(callback:() => void): void
}

declare interface TrackBuilder {
  (instrument:Instrument, notes:Note[]): Track
  unpack(library:Library, packedTrack:PackedTrack): Track
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
