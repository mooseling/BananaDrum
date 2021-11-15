import {TimeConverter} from './TimeConverter';


function trackBuilder(arrangement:Arrangement, instrument:Instrument, packedNotes:PackedNote[]): Track {
  // We keep a TimeConverter here but recreate it if timeParams change
  let timeConverter = TimeConverter(arrangement.timeParams);
  arrangement.timeParams.subscribe(handleTimeParamsChange);

  const subscribers: ((...args:any[]) => void)[] = [];
  const notes:Note[] = [];
  const audioEvents:AudioEvent[] = [];
  const track:Track = {arrangement, instrument, edit, subscribe, getNoteAt, getAudioEvents};
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
    const newNote:Note = {timing, track, noteStyle:instrument.noteStyles[newValue]};
    addNote(newNote);
    publish();
  }


  // You can subscribe to changes in this Track
  function subscribe(callback:(...args:any[]) => void): void {
    subscribers.push(callback);
  }


  function getNoteAt(timing:Timing): Note {
    for (const note of notes) {
      if (note.timing === timing)
        return note;
    }
    return {timing, track, noteStyle:null}; // return a rest if no note is found
  }


  function getAudioEvents({start, end}:Interval):AudioEvent[] {
    return audioEvents.filter(({realTime}) => realTime >= start && realTime <= end);
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
    return {timing, track, noteStyle:instrument.noteStyles[noteStyleId]};
  }


  // Remove existing note if one is found
  // This assumes there will be 1 at the most
  // Returns true if it removes a note
  function removeNoteAt(timing:Timing) {
    const note = notes.filter(note => note.timing === timing)[0];
    if (note) {
      removeNote(note);
      return true;
    }
  }


  function removeNote(note:Note) {
    notes.splice(notes.indexOf(note), 1);
    removeAudioEvent(note);
  }


  function removeAudioEvent(note:Note) {
    return audioEvents.some((audioEvent, index) => {
      if (audioEvent.note === note) {
        audioEvents.splice(index, 1);
        return true;
      }
    });
  }


  function addNote(note:Note) {
    notes.push(note);
    audioEvents.push(createAudioEvent(note));
  }


  function createAudioEvent(note:Note): AudioEvent {
    return {
      note,
      realTime: timeConverter.convertToRealTime(note.timing),
      audioBuffer: note.noteStyle.audioBuffer
    };
  }


  function handleTimeParamsChange() {
    timeConverter = TimeConverter(arrangement.timeParams);

    // Remove notes which are now at invalid times
    notes.filter(note => !arrangement.timeParams.isValid(note.timing)).forEach(removeNote);

    // Real-times for notes need to be recalculated on time signature or tempo changes
    audioEvents.forEach(audioEvent => audioEvent.realTime = timeConverter.convertToRealTime(audioEvent.note.timing));
  }
}


trackBuilder.unpack = function(arrangement:Arrangement, packedTrack:PackedTrack): Track {
  const instrument = arrangement.library.instruments[packedTrack.instrumentId];
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:TrackBuilder = trackBuilder;
