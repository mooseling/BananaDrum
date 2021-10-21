function trackBuilder(instrument:Instrument, notes:Note[]): Track {
  return {instrument, notes, edit};

  function edit(command:EditCommand) {
    const {timing, newValue} = command;

    // Remove existing note if one is found
    // This assumes there will be 1 at the most
    notes.some((note, index) => {
      if (note.timing === timing) {
        notes.splice(index);
        return true;
      }
    });

    // Passing in null is the way to delete a note, so we just stop here
    if (newValue === null)
      return;

    // If we're this far, newValue is a noteStyleId
    const untimedNote = instrument.createUntimedNote(newValue);
    notes.push(Object.assign({timing}, untimedNote));
  }
}


trackBuilder.unpack = function(library:Library, packedTrack:PackedTrack): Track {
  const instrument = library.instruments[packedTrack.instrumentId];
  const notes:Note[] = [];
  packedTrack.packedNotes.forEach(packedNote => notes.push(unpackNote(packedNote, instrument)));
  return Track(instrument, notes);
}


function unpackNote(packedNote:PackedNote, instrument:Instrument): Note {
  const {timing, noteStyleId} = packedNote;
  const untimedNote:UntimedNote = instrument.createUntimedNote(noteStyleId);
  return Object.assign({timing}, untimedNote);
}

export const Track:TrackBuilder = trackBuilder;
