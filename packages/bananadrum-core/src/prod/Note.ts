import { Note, NoteStyle, Polyrhythm, Timing, Track } from './types.js';
import { createPublisher } from './Publisher.js';

let noteCount = 0;

export function createNote(track:Track, timing:Timing, polyrhythm?:Polyrhythm): Note {
  const publisher = createPublisher();
  const id = `${++noteCount}`;
  let noteStyle:NoteStyle|null = null;

  return {
    id, timing, track, polyrhythm,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get noteStyle() {return noteStyle;},
    set noteStyle(newNoteStyle:NoteStyle|null) {
      noteStyle = newNoteStyle;
      publisher.publish();
    }
  }
}
