declare namespace Banana {
  interface Note extends Subscribable {
    timing: Timing
    track: Track
    noteStyle: NoteStyle|null // null means this is a rest
  }

  interface NoteBuilder {
    (track:Track, timing:Timing, noteStyle:NoteStyle|null): Note
  }
}
