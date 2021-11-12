declare interface NoteBuilder {
  (noteInputs:NoteInputs): Note
}

declare interface Note {
  timing: Timing
  track: Track
  noteStyle: NoteStyle|null // null means this is a rest
  createAudioEvent(): AudioEvent
}

interface NoteInputs {
  timing: Timing
  track: Track
  noteStyle: NoteStyle|null
}
