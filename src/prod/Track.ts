import {Library} from './Library';
import {Note} from './Note';
import {Publisher} from './Publisher';
import {getColour} from './colours';
import {isSameTiming} from './utils';

function trackBuilder(arrangement:Banana.Arrangement, instrument:Banana.Instrument, packedNotes:Banana.PackedNote[]): Banana.Track {
  const publisher:Banana.Publisher = Publisher();
  const notes:Banana.Note[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Banana.Track = {arrangement, instrument, notes, getNoteAt, colour, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

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
    return Note(track, timing, instrument.noteStyles[noteStyleId]);
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



function unpackTiming(packedTiming:Banana.PackedTiming): Banana.Timing {
  const [bar, step] = packedTiming.split(':').map(value => Number(value));
  return {bar, step};
}
