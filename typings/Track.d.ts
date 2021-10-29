declare interface Track {
  arrangement: Arrangement
  instrument: Instrument
  notes: Note[] // Exposed so the track can be played
  edit(command: EditCommand): void
  subscribe(callback:(...args:any[]) => void): void
  getNoteAt(timing:Timing): Note
  getNoteEvents(interval:Interval): NoteEvent[]
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
