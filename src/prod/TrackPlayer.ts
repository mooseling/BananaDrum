type NoteWithTime = {realTime:Banana.RealTime, note:Banana.Note};

function buildTrackPlayer(track:Banana.Track, timeCoordinator:Banana.TimeCoordinator): Banana.TrackPlayer {
  const notesWithTime:NoteWithTime[] = [];
  fillInRealTimeNotes();
  let lastNoteCount = track.notes.length;
  track.subscribe(handleNoteCountChange);
  let lastTempo = track.arrangement.timeParams.tempo;
  timeCoordinator.subscribe(handleTimeChange);

  return {track, getEvents};






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  function getEvents({start, end}:Banana.Interval): Banana.AudioEvent[] {
    return notesWithTime.filter(({realTime}) => realTime >= start && realTime < end)
      .filter(({note}) => note.noteStyle) // Filter out rests (which have noteStyle: null)
      .map(({realTime, note}) => ({realTime, note, audioBuffer:note.noteStyle.audioBuffer}))
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function createRealTimeNote(note:Banana.Note): NoteWithTime {
    return {
      realTime: timeCoordinator.convertToRealTime(note.timing),
      note
    };
  }


  function fillInRealTimeNotes() {
    const unmatchedNotes = track.notes.filter(note => !notesWithTime.some(noteWithTime => noteWithTime.note === note));
    notesWithTime.push(...unmatchedNotes.map(createRealTimeNote));
  }


  function removeExtraRealTimeNotes() {
    notesWithTime.filter(({note}) => !track.notes.includes(note))
      .forEach(noteWithTime => notesWithTime.splice(notesWithTime.indexOf(noteWithTime)));
  }


  function handleNoteCountChange() {
    const newNoteCount = track.notes.length;
    if (newNoteCount > lastNoteCount)
      fillInRealTimeNotes();
    else if (newNoteCount < lastNoteCount)
      removeExtraRealTimeNotes();
    lastNoteCount = newNoteCount;
  }


  function handleTimeChange() {
    // We only recalc note times when the tempo changes
    // Length changes do not incur this, and timeSignature currently cannot change
    const newTempo = track.arrangement.timeParams.tempo;
    if (newTempo !== lastTempo) {
      notesWithTime.forEach(noteWithTime => noteWithTime.realTime = timeCoordinator.convertToRealTime(noteWithTime.note.timing));
      lastTempo = newTempo;
    }
  }
}

export const TrackPlayer:Banana.TrackPlayerBuilder = buildTrackPlayer;
