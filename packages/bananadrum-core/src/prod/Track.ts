import { Arrangement, Instrument, Note, PackedNote, PackedTiming, PackedTrack, Timing, Track } from './types.js';
import {Library} from './Library.js';
import {createNote} from './Note.js';
import {createPublisher} from './Publisher.js';
import {TrackClipboard} from './TrackClipboard.js';
import {getColour} from './colours.js';
import {isSameTiming} from './utils.js';

export function createTrack(arrangement:Arrangement, instrument:Instrument, packedNotes?:PackedNote[]): Track {
  const id = getNewId();
  const publisher = createPublisher();
  const notes:Note[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Track = {id, arrangement, instrument, notes, getNoteAt, colour, clear,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  if (packedNotes)
    unpackNotes();
  fillInRests();
  notes.sort((a, b) => (a.timing.bar - b.timing.bar) || (a.timing.step - b.timing.step))
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






  // ==================================================================
  //                          Private Functions
  // ==================================================================


  // Only call if packedNotes is defined
  function unpackNotes(): void {
    packedNotes.forEach(packedNote => notes.push(unpackNote(packedNote)));
  }


  function unpackNote(packedNote:PackedNote): Note {
    const {timing:packedTiming, noteStyleId} = packedNote;
    const timing = unpackTiming(packedTiming);
    return createNote(track, timing, instrument.noteStyles[noteStyleId] ?? null);
  }


  // Return value indicates whether anything changed
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


export function unpackTrack(arrangement:Arrangement, packedTrack:PackedTrack):
  Track {
  const instrument = Library.getInstrument(packedTrack.instrumentId);
  return createTrack(arrangement, instrument, packedTrack.packedNotes);
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



function unpackTiming(packedTiming:PackedTiming): Timing {
  const [bar, step] = packedTiming.split(':').map(value => Number(value));
  return {bar, step};
}
