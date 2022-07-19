import {Publisher} from './Publisher';
import {EventEngine} from './EventEngine';

let noteCount = 0;

function buildNote(track:Banana.Track, timing:Banana.Timing, noteStyle:Banana.NoteStyle|null): Banana.Note {
  const publisher = Publisher();
  const id = `${++noteCount}`;

  return {
    id, timing, track, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get noteStyle() {return noteStyle;},
    set noteStyle(newNoteStyle:Banana.NoteStyle|null) {
      noteStyle = newNoteStyle;
      if (noteStyle !== null)
        playNow(noteStyle)
      publisher.publish();
    }
  }
}

export const Note:Banana.NoteBuilder = buildNote;


function playNow(noteStyle:Banana.NoteStyle) {
  if (noteStyle.audioBuffer) {
    EventEngine.playSound(noteStyle.audioBuffer);
  }
}
