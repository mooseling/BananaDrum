import { Timing, Note, Track, CopyRequest, PasteRequest, Polyrhythm } from './types/general.js';
import { isSameTiming, subtractTimings, addDelta, isIntervalWithinLimits } from './utils.js';

function isPolyrhytmWithinLimits(polyrhythm: Polyrhythm, start: Timing, end: Timing): boolean {
    return isIntervalWithinLimits(polyrhythm.start.timing, polyrhythm.end.timing, start, end);
}

export class TrackClipboard {
  private track:Track;
  private buffer: Note[] = [];
  private polyrhytmsBuffer: Polyrhythm[] = [];

  constructor(track:Track) {
    this.track = track;
    return this;
  }

  get length() {
    return this.buffer.length;
  }

  copy({start, end}: CopyRequest) {
    const notes = this.track.notes;
    let note = this.track.getNoteAt(start);
    let index = notes.indexOf(note);
    this.buffer = [];
    this.polyrhytmsBuffer = [];

    // copy polyrhytms
    // NOTE: only copied if fully within selection
    this.polyrhytmsBuffer.push(...this.track.polyrhythms.filter(p => isPolyrhytmWithinLimits(p, start, end)));

    // copy notes
    while (true) {
      this.buffer.push(note);
      if (isSameTiming(note.timing, end))
        return; // Reached end of region to copy

      index++;
      note = notes[index];
      if (!note)
        return; // Reached end of track
    }
  }

  paste({start, end}: PasteRequest) {
    if (end === undefined)
      end = this.track.notes[this.track.notes.length - 1].timing;
    const notes = this.track.notes;
    let note = this.track.getNoteAt(start);
    let trackIndex = notes.indexOf(note);
    let bufferIndex = 0;
    let noteStyleToPaste = this.buffer[0].noteStyle;

    if (this.buffer.length === 0)
      return;

    // paste notes
    while (true) {
      note.noteStyle = noteStyleToPaste;
      if (end && isSameTiming(note.timing, end))
        break;

      bufferIndex++;
      if (bufferIndex >= this.buffer.length)
        break; // Reached end of clipboard
      noteStyleToPaste = this.buffer[bufferIndex].noteStyle;

      trackIndex++;
      if (trackIndex >= notes.length)
        break; // Reached end of track
      note = notes[trackIndex];
    }

    //paste polyrhytms
    //NOTE: only pasted if fully within selection
    if (this.polyrhytmsBuffer.length === 0)
      return;
    let firstCopiedTiming = this.buffer[0].timing;
    let delta = subtractTimings(start, firstCopiedTiming);
    this.polyrhytmsBuffer.forEach(polyrhytm => {
      let pastedStart = addDelta(polyrhytm.start.timing, delta);
      let pastedEnd = addDelta(polyrhytm.end.timing, delta);
      if (isIntervalWithinLimits(pastedStart, pastedEnd, start, end))
        this.track.addPolyrhythm(this.track.getNoteAt(pastedStart), this.track.getNoteAt(pastedEnd), polyrhytm.notes.length, undefined, undefined, polyrhytm.notes.map(n => n.noteStyle));
    });
  }
}
