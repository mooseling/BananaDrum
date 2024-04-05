import { Arrangement, Instrument, Note, Polyrhythm, Timing, Track } from './types.js';
import { createNote } from './Note.js';
import { createPublisher } from './Publisher.js';
import { TrackClipboard } from './TrackClipboard.js';
import { getColour } from './colours.js';
import { isSameTiming } from './utils.js';

export function createTrack(arrangement:Arrangement, instrument:Instrument): Track {
  const id = getNewId();
  const publisher = createPublisher();
  const notes:Note[] = [];
  const polyrhythms:Polyrhythm[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Track = {id, arrangement, instrument, notes, polyrhythms, addPolyrhythm, removePolyrhythm, getNoteAt, colour, clear,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  // Initialise all Notes as rests
  arrangement.timeParams.timings.forEach(timing => notes.push(createNote(track, timing, null)));

  arrangement.timeParams.subscribe(handleTimeParamsChange);
  arrangement.subscribe(destroySelfIfNeeded);

  return track;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function getNoteAt(timing:Timing): Note {
    for (const note of notes) {
      if (isSameTiming(note.timing, timing))
        return note;
    }
  }


  function clear() {
    notes.forEach(note => note.noteStyle = null);
  }


  function addPolyrhythm(start:Note, end:Note, length:number) {
    polyrhythms.push({
      start, end,
      notes: Array.from(Array(length)).map((_, index) => createNote(track, {bar:1, step:index}, null))
    });
    publisher.publish();
  }


  function removePolyrhythm(polyrhythm:Polyrhythm) {
    polyrhythms.splice(polyrhythms.indexOf(polyrhythm), 1);
    publisher.publish();
  }




  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function fillInRests(): void {
    const timingsWithNoNotes = arrangement.timeParams.timings
      .filter(timing => !notes.some(note => isSameTiming(note.timing, timing)));
    if (timingsWithNoNotes.length) {
      timingsWithNoNotes.forEach(timing => notes.push(createNote(track, timing, null)));
      notes.sort((a, b) => (a.timing.bar - b.timing.bar) || (a.timing.step - b.timing.step));
    }
  }


  function handleTimeParamsChange() {
    const originalNoteCount = notes.length;

    // Remove invalid notes, e.g. arrangement has shortened
    let index = 0;
    while (index < notes.length) {
      if (!arrangement.timeParams.isValid(notes[index].timing)) {
        notes.splice(index, 1);
      } else {
        index++;
      }
    }

    fillInRests(); // Fill in new notes, e.g. arrangement has lengthened

    if (originalNoteCount !== notes.length) {
      if (notes.length > originalNoteCount)
        copyComposition(originalNoteCount);
      publisher.publish();
    }
  }


  function copyComposition(originalNoteCount:number): void {
    const lastTiming = track.notes[originalNoteCount - 1].timing;

    const clipboard = new TrackClipboard(track);
    clipboard.copy({
      start:{bar:1, step:1},
      end:lastTiming
    });
    let numNotesCovered = clipboard.length;

    while (numNotesCovered < track.notes.length) {
      const pasteStart = track.notes[numNotesCovered].timing;
      clipboard.paste({start:pasteStart});
      numNotesCovered += clipboard.length;
    }
  }


  function destroySelfIfNeeded() {
    // Check track still exists
    for (const trackId in arrangement.tracks) {
      if (arrangement.tracks[trackId] === track)
        return;
    }
    // ... otherwise unsubscribe from everything
    arrangement.timeParams.unsubscribe(handleTimeParamsChange);
    arrangement.unsubscribe(destroySelfIfNeeded);
  }
}






// ==================================================================
//                       Private Static Functions
// ==================================================================




// Track-ids need to be unique, so we simply bung a globally increasing counter on them
let trackCounter = 0;
// We need unique identifiers for tracks, even if their instrument is the same
// This needs to work even if instruments have been deleted

// Even though these are strings, ArrangementViewer relies on them being numbers!
// Bad, I know...
function getNewId(): string {
  trackCounter++;
  return `${trackCounter}`;
}
