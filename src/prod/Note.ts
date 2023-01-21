import { Note, NoteStyle, Timing, Track } from './types';
import {createPublisher} from './Publisher';

let noteCount = 0;

export function createNote(track:Track, timing:Timing, noteStyle:NoteStyle|null): Note {
  const publisher = createPublisher();
  const id = `${++noteCount}`;

  return {
    id, timing, track, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get noteStyle() {return noteStyle;},
    set noteStyle(newNoteStyle:NoteStyle|null) {
      noteStyle = newNoteStyle;
      publisher.publish();
    }
  }
}
