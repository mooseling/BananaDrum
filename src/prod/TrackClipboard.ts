import {isSameTiming} from './utils';

export class TrackClipboard implements Banana.TrackClipboard {
  private track:Banana.Track;
  private buffer:Banana.NoteStyle[] = [];

  constructor(track:Banana.Track) {
    this.track = track;
    return this;
  }

  get length() {
    return this.buffer.length;
  }

  copy({start, end}: Banana.CopyRequest) {
    const notes = this.track.notes;
    let note = this.track.getNoteAt(start);
    let index = notes.indexOf(note);
    this.buffer = [note.noteStyle];

    while (!isSameTiming(note.timing, end) && (note = notes[++index]))
      this.buffer.push(note.noteStyle);
  }

  paste({start, end}: Banana.PasteRequest) {
    const notes = this.track.notes;
    let note = this.track.getNoteAt(start);
    let trackIndex = notes.indexOf(note);
    let bufferIndex = 0;
    let noteStyleToPaste:Banana.NoteStyle;

    while (
      (!end || !isSameTiming(note.timing, end))
      && (note = notes[trackIndex++])
      && (noteStyleToPaste = this.buffer[bufferIndex++])
    )
      note.noteStyle = noteStyleToPaste;
  }
}
