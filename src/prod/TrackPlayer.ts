type NoteWithTime = {realTime:Banana.RealTime, note:Banana.Note};

function buildTrackPlayer(track:Banana.Track, timeCoordinator:Banana.TimeCoordinator): Banana.TrackPlayer {
  let notesWithTime:NoteWithTime[] = [];

  if (track.instrument.loaded) {
    fillInRealTimeNotes();
  } else {
    const setupNotes = () => {
      fillInRealTimeNotes();
      track.instrument.unsubscribe(setupNotes);
    }
    track.instrument.subscribe(setupNotes);
  }

  let lastNoteCount = track.notes.length;
  track.subscribe(handleNoteCountChange);
  let lastLength = track.arrangement.timeParams.length;
  timeCoordinator.subscribe(handleTimeChange);
  track.arrangement.subscribe(destroySelfIfNeeded);
  let soloMute:Banana.SoloMute = null;

  return {
    track, getEvents,
    get soloMute() {return soloMute;},
    set soloMute(newSoloMute:Banana.SoloMute) {soloMute = newSoloMute}
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  function getEvents({start, end}:Banana.Interval): Banana.AudioEvent[] {
    if (!track.instrument.loaded)
      return [];
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
    notesWithTime = notesWithTime.filter(({note}) => track.notes.includes(note))
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
    // Unnecessary to recalc note times when the length changes
    if (track.arrangement.timeParams.length !== lastLength) {
      lastLength = track.arrangement.timeParams.length;
      return;
    }

    notesWithTime.forEach(noteWithTime => noteWithTime.realTime = timeCoordinator.convertToRealTime(noteWithTime.note.timing));
  }


  function destroySelfIfNeeded() {
    // Check track still exists
    for (const trackId in track.arrangement.tracks) {
      if (track.arrangement.tracks[trackId] === track)
        return;
    }
    // ... otherwise unsubscribe from everything
    timeCoordinator.unsubscribe(handleTimeChange);
    track.arrangement.unsubscribe(destroySelfIfNeeded);
  }
}

export const TrackPlayer:Banana.TrackPlayerBuilder = buildTrackPlayer;
