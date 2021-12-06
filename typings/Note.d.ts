declare namespace Banana {
  interface Note {
    timing: Timing
    track: Track
    noteStyle: NoteStyle|null // null means this is a rest
  }
}
