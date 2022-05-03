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
  fillInRestsAndSort();
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
    packedNotes.forEach(packedNote => {
      const {timing:packedTiming, noteStyleId} = packedNote;
      const timing:Banana.Timing = unpackTiming(packedTiming);
      addNewNote(timing, instrument.noteStyles[noteStyleId]);
    });
  }


  // Return value indicates whether anything changed
  function fillInRestsAndSort(): boolean {
    const timingsWithNoNotes = arrangement.timeParams.timings
      .filter(timing => !notes.some(note => isSameTiming(note.timing, timing)));
    if (timingsWithNoNotes.length) {
      timingsWithNoNotes.forEach(timing => addNewNote(timing, null));
      notes.sort(chronologically);
      return true;
    }
    return false;
  }


  function addNewNote(timing:Banana.Timing, noteStyle:Banana.NoteStyle): void {
    const note = Note(track, timing, noteStyle);
    notes.push(note);
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
    if(fillInRestsAndSort())
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


trackBuilder.unpack = async function(arrangement:Banana.Arrangement, packedTrack:Banana.PackedTrack): Promise<Banana.Track> {
  const instrument = await Library.getInstrument(packedTrack.instrumentId);
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:Banana.TrackBuilder = trackBuilder;



function unpackTiming(packedTiming:Banana.PackedTiming): Banana.Timing {
  const [bar, step] = packedTiming.split(':').map(value => Number(value));
  return {bar, step};
}


function chronologically(note1:Banana.Note, note2:Banana.Note): number {
  return (note1.timing.bar - note2.timing.bar) || (note1.timing.step - note2.timing.step)
}
