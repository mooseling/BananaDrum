import {Library} from './Library';
import {Note} from './Note';
import {Publisher} from './Publisher';
import {getColour} from './colours';
import {isSameTiming} from './utils';

function trackBuilder(arrangement:Banana.Arrangement, instrument:Banana.Instrument, packedNotes:Banana.PackedNote[]): Banana.Track {
  const id = getNewId();
  const publisher:Banana.Publisher = Publisher();
  const notes:Banana.Note[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Banana.Track = {id, arrangement, instrument, notes, getNoteAt, colour, clear,
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


  function getNoteAt(timing:Banana.Timing): Banana.Note {
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


  function unpackNote(packedNote:Banana.PackedNote): Banana.Note {
    const {timing:packedTiming, noteStyleId} = packedNote;
    const timing:Banana.Timing = unpackTiming(packedTiming);
    return Note(track, timing, instrument.noteStyles[noteStyleId] ?? null);
  }


  // Return value indicates whether anything changed
  function fillInRests(): boolean {
    const timingsWithNoNotes = arrangement.timeParams.timings
      .filter(timing => !notes.some(note => isSameTiming(note.timing, timing)));
    if (timingsWithNoNotes.length) {
      timingsWithNoNotes.forEach(timing => notes.push(Note(track, timing, null)));
      notes.sort((a, b) => (a.timing.bar - b.timing.bar) || (a.timing.step - b.timing.step));
      return true;
    }
    return false;
  }


  function handleTimeParamsChange() {
    let somethingChanged = false;

    // Remove invalid notes, e.g. arrangement has shortened
    let index = 0;
    while (index < notes.length) {
      if (!arrangement.timeParams.isValid(notes[index].timing)) {
        notes.splice(index, 1);
        somethingChanged = true;
      } else {
        index++;
      }
    }

    // Fill in new notes, e.g. arrangement has lengthened
    if(fillInRests())
      somethingChanged = true;

    if (somethingChanged)
      publisher.publish();
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


trackBuilder.unpack = function(arrangement:Banana.Arrangement, packedTrack:Banana.PackedTrack):
  Banana.Track {
  const instrument = Library.getInstrument(packedTrack.instrumentId);
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:Banana.TrackBuilder = trackBuilder;






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



function unpackTiming(packedTiming:Banana.PackedTiming): Banana.Timing {
  const [bar, step] = packedTiming.split(':').map(value => Number(value));
  return {bar, step};
}
