declare interface Note {
  timing: Timing
  track: Track
  noteStyle: NoteStyle|null // null means this is a rest
  // It simplifies UI things if we can still have a Note object for rests
}
