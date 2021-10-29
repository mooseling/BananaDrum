import {TimeConverter} from './TimeConverter';


function trackBuilder(arrangement:Arrangement, instrument:Instrument, packedNotes:PackedNote[]): Track {
  let subscribers: ((...args:any[]) => void)[] = [];
  const timeConverter = TimeConverter(arrangement);
  const notes:Note[] = [];
  const noteEvents:NoteEvent[] = [];
  const track:Track = {arrangement, instrument, notes, edit, subscribe, getNoteAt, getNoteEvents};
  if (packedNotes)
    unpackNotes();

  return track;

  // ==================================================================
  //                          Public Functions
  // ==================================================================

  // Add, remove, or change notes
  // Publishes every time it makes a change
  function edit(command:EditCommand) {
    const {timing, newValue} = command;
    if (removeNoteAt(timing))
      publish();

    // Passing in null is the way to delete a note
    if (newValue === null)
      return;

    // If we're this far, newValue is a noteStyleId
    addNote({timing, track, noteStyle:instrument.noteStyles[newValue]});
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


  function getNoteEvents(interval:Interval):NoteEvent[] {
    const noteEventsInInterval: NoteEvent[] = [];
    for (const noteEvent of noteEvents) {
      if (noteEvent.realTime >= interval.start && noteEvent.realTime <= interval.end) {
        noteEventsInInterval.push(noteEvent);
      }
    }
    return noteEventsInInterval;
  }

    // ==================================================================
    //                          Private Functions
    // ==================================================================

  function publish(): void {
    subscribers.forEach(callback => callback());
  }


  // Only call if packedNotes is defined
  function unpackNotes(): void {
    packedNotes.forEach(packedNote => addNote(unpackNote(packedNote)));
  }

  function unpackNote(packedNote:PackedNote): Note {
    const {timing, noteStyleId} = packedNote;
    return {timing, track, noteStyle:instrument.noteStyles[noteStyleId]}
  }


  function createNoteEvent(note:Note) {
    return {
      note,
      realTime: timeConverter.convertToRealTime(note.timing)
    };
  }


  // Remove existing note if one is found
  // This assumes there will be 1 at the most
  // Returns true if it removes a note
  function removeNoteAt(timing:Timing) {
    return notes.some((note, index) => {
      if (note.timing === timing) {
        notes.splice(index, 1);
        removeNoteEvent(note);
        return true;
      }
    });
  }


  function removeNoteEvent(note:Note) {
    return noteEvents.some((noteEvent, index) => {
      if (noteEvent.note === note) {
        noteEvents.splice(index, 1);
        return true;
      }
    });
  }


  function addNote(note:Note) {
    notes.push(note);
    noteEvents.push(createNoteEvent(note));
  }
}


trackBuilder.unpack = function(arrangement:Arrangement, packedTrack:PackedTrack): Track {
  const instrument = arrangement.library.instruments[packedTrack.instrumentId];
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:TrackBuilder = trackBuilder;
