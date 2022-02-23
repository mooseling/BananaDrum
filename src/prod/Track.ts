import {Library} from './Library';
import {Note} from './Note';
import {Publisher} from './Publisher';
import {getColour} from './colours';

function trackBuilder(arrangement:Banana.Arrangement, instrument:Banana.Instrument, packedNotes:Banana.PackedNote[]): Banana.Track {
  const publisher:Banana.Publisher = Publisher();
  const notes:Banana.Note[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Banana.Track = {arrangement, instrument, notes, getNoteAt, colour, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  if (packedNotes)
    unpackNotes();
  fillInRests();
  arrangement.timeParams.subscribe(handleTimeParamsChange);

  return track;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function getNoteAt(timing:Banana.Timing): Banana.Note {
    for (const note of notes) {
      if (note.timing === timing)
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
    const {timing, noteStyleId} = packedNote;
    return Note(track, timing, instrument.noteStyles[noteStyleId]);
  }


  function fillInRests() {
    const allSixteenths = arrangement.getSixteenths();
    const sixteenthsWithNoNotes = allSixteenths.filter(timing => !notes.some(note => note.timing === timing));
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
    if (notes.length !== initialNoteCount)
      publisher.publish();
  }
}


trackBuilder.unpack = async function(arrangement:Banana.Arrangement, packedTrack:Banana.PackedTrack): Promise<Banana.Track> {
  const instrument = await Library.getInstrument(packedTrack.instrumentId);
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:Banana.TrackBuilder = trackBuilder;
