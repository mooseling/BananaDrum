import {TimeConverter} from './TimeConverter';


function buildTrackPlayer(track:Track): AudioEventSource {
  let timeConverter = TimeConverter(track.arrangement.timeParams);
  const audioEvents:AudioEvent[] = track.notes.map(note => createAudioEvent(note));
  track.subscribe(matchAudioEventsToNotes);

  return {getAudioEvents};


  function getAudioEvents({start, end}:Interval): AudioEvent[] {
    return audioEvents.filter(({realTime}) => realTime >= start && realTime <= end);
  }



  function matchAudioEventsToNotes() {
    const unmatchedAudioEvents = audioEvents.filter(audioEvent => !track.notes.includes(audioEvent.note));
    unmatchedAudioEvents.forEach(audioEvent => audioEvents.splice(audioEvents.indexOf(audioEvent)));
    const unmatchedNotes = track.notes.filter(note => !audioEvents.some(audioEvent => audioEvent.note === note));
    audioEvents.push(...unmatchedNotes.map(createAudioEvent));
  }


  function createAudioEvent(note:Note): AudioEvent {
    return {
      identifier: getIdentifier(note),
      realTime: timeConverter.convertToRealTime(note.timing),
      audioBuffer: note.noteStyle.audioBuffer,
      note
    };
  }
}
export const TrackPlayer:TrackPlayerBuilder = buildTrackPlayer;


// Need to uniquely identify the event from the Track's perspective
function getIdentifier({noteStyle, timing}:Note): string {
  return `${noteStyle.noteStyleId}_${timing}`;
}
