import { Note, NoteStyle, Timing, Track } from './types.js';
import { createPublisher } from './Publisher.js';

let noteCount = 0;

export function createNote(track:Track, timing:Timing): Note {
  const publisher = createPublisher();
  const id = `${++noteCount}`;
  let noteStyle:NoteStyle|null = null;

  return {
    id, timing, track, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get noteStyle() {return noteStyle;},
    set noteStyle(newNoteStyle:NoteStyle|null) {
      noteStyle = newNoteStyle;
      publisher.publish();
    }
  }
}
