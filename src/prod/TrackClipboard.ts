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
    this.buffer = [];

    while (true) {
      this.buffer.push(note.noteStyle);
      if (isSameTiming(note.timing, end))
        return; // Reached end of region to copy

      index++;
      note = notes[index];
      if (!note)
        return; // Reached end of track
    }
  }

  paste({start, end}: Banana.PasteRequest) {
    const notes = this.track.notes;
    let note = this.track.getNoteAt(start);
    let trackIndex = notes.indexOf(note);
    let bufferIndex = 0;
    let noteStyleToPaste = this.buffer[0];

    while (true) {
      note.noteStyle = noteStyleToPaste;
      if (end && isSameTiming(note.timing, end))
        return;

      bufferIndex++;
      if (bufferIndex >= this.buffer.length)
        return; // Reached end of clipboard
      noteStyleToPaste = this.buffer[bufferIndex];

      trackIndex++;
      if (trackIndex >= notes.length)
        return; // Reached end of track
      note = notes[trackIndex];
    }
  }
}
