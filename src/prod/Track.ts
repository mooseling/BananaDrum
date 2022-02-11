import {Library} from './Library';
import {Publisher} from './Publisher';
import {getColour} from './colours';

function trackBuilder(arrangement:Banana.Arrangement, instrument:Banana.Instrument, packedNotes:Banana.PackedNote[]): Banana.Track {
  const publisher:Banana.Publisher = Publisher();
  const notes:Banana.Note[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Banana.Track = {arrangement, instrument, notes, edit, getNoteAt, colour, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};
  if (packedNotes)
    unpackNotes();
  arrangement.timeParams.subscribe(handleTimeParamsChange);

  return track;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  // Add, remove, or change notes
  // Publishes every time it makes a change
  function edit(command:Banana.EditCommand) {
    const {timing, newValue} = command;
    if (removeNoteAt(timing))
      publisher.publish();

    // Passing in null is the way to delete a note
    if (newValue === null)
      return;

    // If we're this far, newValue is a noteStyleId
    const newNote:Banana.Note = {timing, track, noteStyle:instrument.noteStyles[newValue]};
    notes.push(newNote);
    publisher.publish();
  }


  function getNoteAt(timing:Banana.Timing): Banana.Note {
    for (const note of notes) {
      if (note.timing === timing)
        return note;
    }
    return {timing, track, noteStyle:null}; // return a rest if no note is found
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
    return {timing, track, noteStyle:instrument.noteStyles[noteStyleId]};
  }


  // Remove existing note if one is found
  // This assumes there will be 1 at the most
  // Returns true if it removes a note
  function removeNoteAt(timing:Banana.Timing) {
    return notes.some((note, index) => (note.timing === timing) && notes.splice(index, 1));
  }


  // When timeParams changes, we need to remove notes which have become invalid
  function handleTimeParamsChange() {
    const initialNoteCount = notes.length;
    while(notes.some((note, index) => {
      if (!arrangement.timeParams.isValid(note.timing)) {
        notes.splice(index);
        return true;
      }
    }));
    if (notes.length !== initialNoteCount)
      publisher.publish();
  }
}


trackBuilder.unpack = async function(arrangement:Banana.Arrangement, packedTrack:Banana.PackedTrack): Promise<Banana.Track> {
  const instrument = await Library.getInstrument(packedTrack.instrumentId);
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:Banana.TrackBuilder = trackBuilder;
