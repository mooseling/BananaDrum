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


  function fillInRests() {
    const sixteenthsWithNoNotes = arrangement.timeParams.timings
      .filter(timing => !notes.some(note => isSameTiming(note.timing, timing)));
    sixteenthsWithNoNotes.forEach(timing => notes.push(Note(track, timing, null)));
  }


  function handleTimeParamsChange() {
    const initialNoteCount = notes.length;

    // Remove invalid notes, e.g. arrangement has shortened
    while(notes.some((note, index) => {
      if (!arrangement.timeParams.isValid(note.timing)) {
        notes.splice(index);
        return true;
      }
    }));

    // Fill in new notes, e.g. arrangement has lengthened
    fillInRests();
    // We may have added notes between other notes, e.g. time signature has changed
    notes.sort((a, b) => (a.timing.bar - b.timing.bar) || (a.timing.step - b.timing.step))
    if (notes.length !== initialNoteCount)
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


trackBuilder.unpack = async function(arrangement:Banana.Arrangement, packedTrack:Banana.PackedTrack): Promise<Banana.Track> {
  const instrument = await Library.getInstrument(packedTrack.instrumentId);
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:Banana.TrackBuilder = trackBuilder;



function unpackTiming(packedTiming:Banana.PackedTiming): Banana.Timing {
  const [bar, step] = packedTiming.split(':').map(value => Number(value));
  return {bar, step};
}
