function trackBuilder(instrument:Instrument, packedNotes:PackedNote[]): Track {
  let subscribers: (() => void)[] = [];
  const notes = [];
  const track:Track = {instrument, notes, edit, subscribe, getNoteAt};
  if (packedNotes)
    unpackNotes();

  return track;

  // ==================================================================
  //                          Public Functions
  // ==================================================================

  function edit(command:EditCommand) {
    const {timing, newValue} = command;

    // Remove existing note if one is found
    // This assumes there will be 1 at the most
    notes.some((note, index) => {
      if (note.timing === timing) {
        notes.splice(index);
        publish();
        return true;
      }
    });

    // Passing in null is the way to delete a note
    if (newValue === null)
      return;

    // If we're this far, newValue is a noteStyleId
    notes.push({timing, track, noteStyle:instrument.noteStyles[newValue]});

    // A change has been made, notify subscribers
    publish();
  }


  // You can subscribe to changes in this Track
  function subscribe(callback:() => void): void {
    subscribers.push(callback);
  }


  function getNoteAt(timing:Timing): Note|undefined {
    for (const note of notes) {
      if (note.timing === timing)
        return note;
    }
    return {timing, track, noteStyle:null};
  }

    // ==================================================================
    //                          Private Functions
    // ==================================================================

  function publish(): void {
    subscribers.forEach(callback => callback());
  }


  // Only call if packedNotes is defined
  function unpackNotes(): void {
    packedNotes.forEach(packedNote => notes.push(unpackNote(packedNote)));
  }

  function unpackNote(packedNote:PackedNote): Note {
    const {timing, noteStyleId} = packedNote;
    return {timing, track, noteStyle:instrument.noteStyles[noteStyleId]}
  }
}


trackBuilder.unpack = function(library:Library, packedTrack:PackedTrack): Track {
  const instrument = library.instruments[packedTrack.instrumentId];
  return Track(instrument, packedTrack.packedNotes);
}

export const Track:TrackBuilder = trackBuilder;
