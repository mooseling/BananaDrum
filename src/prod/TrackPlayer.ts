function buildTrackPlayer(track:Banana.Track, timeCoordinator:Banana.TimeCoordinator): Banana.TrackPlayer {
  const audioEvents:Banana.AudioEvent[] = track.notes.map(note => createAudioEvent(note));
  track.subscribe(matchAudioEventsToNotes);
  timeCoordinator.subscribe(recalcAudioEventTimes);

  return {getEvents};






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  function getEvents({start, end}:Banana.Interval): Banana.AudioEvent[] {
    return audioEvents.filter(({realTime}) => realTime >= start && realTime < end);
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function createAudioEvent(note:Banana.Note): Banana.AudioEvent {
    return {
      realTime: timeCoordinator.convertToRealTime(note.timing),
      audioBuffer: note.noteStyle.audioBuffer,
      note
    };
  }


  function matchAudioEventsToNotes() {
    const unmatchedAudioEvents = audioEvents.filter(audioEvent => !track.notes.includes(audioEvent.note));
    unmatchedAudioEvents.forEach(audioEvent => audioEvents.splice(audioEvents.indexOf(audioEvent)));
    const unmatchedNotes = track.notes.filter(note => !audioEvents.some(audioEvent => audioEvent.note === note));
    audioEvents.push(...unmatchedNotes.map(createAudioEvent));
  }


  function recalcAudioEventTimes() {
    audioEvents.forEach(event => event.realTime = timeCoordinator.convertToRealTime(event.note.timing));
  }
}

export const TrackPlayer:Banana.TrackPlayerBuilder = buildTrackPlayer;
