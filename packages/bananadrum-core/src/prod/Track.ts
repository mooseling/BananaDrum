import { Arrangement, Instrument, Note, Polyrhythm, Timing, Track } from './types/types.js';
import { createNote } from './Note.js';
import { createPublisher } from './Publisher.js';
import { TrackClipboard } from './TrackClipboard.js';
import { getColour } from './colours.js';
import { getNewId, isSameTiming } from './utils.js';


export function createTrack(arrangement:Arrangement, instrument:Instrument): Track {
  const id = getNewId();
  const publisher = createPublisher();
  const notes:Note[] = [];
  const polyrhythms:Polyrhythm[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Track = {
    id, arrangement, instrument, notes, polyrhythms, addPolyrhythm, removePolyrhythm, getNoteAt, clear, getNoteIterator, colour,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };

  // Initialise all Notes as rests
  arrangement.timeParams.timings.forEach(timing => notes.push(createNote(track, timing)));

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
    polyrhythms.forEach(({notes}) => notes.forEach(note => note.noteStyle = null));
  }


  function addPolyrhythm(start:Note, end:Note, length:number) {
    if (length < 1)
      return;

    const polyrhythm = {
      start, end,
      id: getNewId(),
      notes:[]
    };

    polyrhythm.notes = Array.from(Array(length))
      .map((_, index) => createNote(track, {bar:1, step:index}, polyrhythm));

    polyrhythms.push(polyrhythm);
    publisher.publish();
  }


  function removePolyrhythm(polyrhythm:Polyrhythm) {
    polyrhythms.splice(polyrhythms.indexOf(polyrhythm), 1);
    publisher.publish();
  }


  // The note-iterator is what makes polyrhythms work
  // polyrhythmsToIgnore is for serialising, so we can walk the notes as if the polyrhythm hasn't been crated yet
  function *getNoteIterator(polyrhythmsToIgnore:Polyrhythm[] = []) {
    let index = 0;
    let currentNoteSource = track.notes;
    let note:Note;

    while (note = currentNoteSource[index], note !== undefined) {

      // First, ascend polyrhythms until we reach a visible note
      // Could speed this up with a map
      const linkedPolyrhyhmUp = polyrhythms.find(polyrhythm => polyrhythm.start === note);
      if (linkedPolyrhyhmUp && !polyrhythmsToIgnore.includes(linkedPolyrhyhmUp)) {
        currentNoteSource = linkedPolyrhyhmUp.notes
        index = 0;
      } else {
        yield note;

        // If we're at the end of a polyrhythm, descend until we're not
        while (note.polyrhythm && !currentNoteSource[index + 1]) {
          note = note.polyrhythm.end;
          currentNoteSource = note.polyrhythm?.notes ?? note.track.notes;
          index = currentNoteSource.indexOf(note);
        }

        index++;
      }
    }
  }




  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function fillInRests(): void {
    const timingsWithNoNotes = arrangement.timeParams.timings
      .filter(timing => !notes.some(note => isSameTiming(note.timing, timing)));
    if (timingsWithNoNotes.length) {
      timingsWithNoNotes.forEach(timing => notes.push(createNote(track, timing)));
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

    removeBrokenPolyrhythms();
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


  function removeBrokenPolyrhythms() {
    if (!polyrhythms.length)
      return;

    const initialPolyrhythmCount = polyrhythms.length;

    // Iterate from earliest polyrhtyhms to latest
    // Therefore, if we consider a nested polyrhythm, we know its root polyrhythms have already been checked
    let index = 0;
    while (index < polyrhythms.length) {
      const {start, end} = polyrhythms[index];

      if (start.polyrhythm) {
        if (!polyrhythms.includes(start.polyrhythm)) {
          polyrhythms.splice(index, 1);
          continue;
        }
      } else if (!notes.includes(start)) {
        polyrhythms.splice(index, 1);
        continue;
      }

      if (end.polyrhythm) {
        if (!polyrhythms.includes(end.polyrhythm)) {
          polyrhythms.splice(index, 1);
          continue;
        }
      } else if (!notes.includes(end)) {
        polyrhythms.splice(index, 1);
        continue;
      }

      index++;
    }

    if (polyrhythms.length < initialPolyrhythmCount)
      publisher.publish();

  }


  function destroySelfIfNeeded() {
    // Check track still exists
    if (arrangement.tracks.indexOf(track) !== -1)
      return;

    // ... otherwise unsubscribe from everything
    arrangement.timeParams.unsubscribe(handleTimeParamsChange);
    arrangement.unsubscribe(destroySelfIfNeeded);
  }
}
