import {AudioPlayer} from './AudioPlayer.js';
import {TimeConverter} from './TimeConverter.js';

export function ArrangementPlayer(library:Library, arrangement:Arrangement) {
  const noteSource:NoteSource = {getPlayableNotes, library};
  const audioPlayer = AudioPlayer(noteSource);
  const {timeSignature, tempo} = arrangement;
  const timeConverter:TimeConverter = TimeConverter(timeSignature, tempo);
  const playableNotes:PlayableNote[] = extractPlayableNotes();

  return {play};




  // ==================================================================
  //                          Public Functions
  // ==================================================================

  function play() {
    audioPlayer.play();
  }



  // ==================================================================
  //                          Private Functions
  // ==================================================================

  function getPlayableNotes(intervalStart: number, intervalEnd: number): PlayableNote[] {
    const wantedNotes = [];
    for (const note of playableNotes) {
      if (!note.played && note.realTime >= intervalStart && note.realTime <= intervalEnd) {
        wantedNotes.push(note);
        note.played = true;
      }
    }
    return wantedNotes;
  }

  function extractPlayableNotes() {
    const playableNotes = [];
    arrangement.tracks.forEach(track => track.notes.forEach(note => playableNotes.push(getPlayableNote(note))));
    return playableNotes;
  }

  function getPlayableNote(note: Note): PlayableNote {
    return {note, realTime: timeConverter.convertToRealTime(note.timing)};
  }
}
