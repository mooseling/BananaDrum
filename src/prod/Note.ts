import {Publisher} from './Publisher';

function buildNote(track:Banana.Track, timing:Banana.Timing, noteStyle:Banana.NoteStyle|null): Banana.Note {
  const publisher = Publisher();

  return {
    timing, track, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get noteStyle() {return noteStyle;},
    set noteStyle(newNoteStyle:Banana.NoteStyle|null) {
      noteStyle = newNoteStyle;
      publisher.publish();
    }
  }
}

export const Note:Banana.NoteBuilder = buildNote;
