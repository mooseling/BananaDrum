import {AudioPlayer} from './AudioPlayer.js';
import {TimeConverter} from './TimeConverter.js';

export function ArrangementPlayer(library:Library) {
  const playableNotes: PlayableNote[] = [];
  const noteSource: NoteSource = {getPlayableNotes, library};
  const audioPlayer = AudioPlayer(noteSource);
  let loadedArrangement: Arrangement|null = null;
  let timeSignature: string|null = null;
  let tempo: number|null = null;
  let timeConverter: TimeConverter|null = null;

  return {load, play};




  // ==================================================================
  //                          Public Functions
  // ==================================================================

  function load(arrangement: Arrangement) {
    loadedArrangement = arrangement;
    ({timeSignature, tempo} = loadedArrangement);
    timeConverter = TimeConverter(timeSignature, tempo);
    arrangement.tracks.forEach(track => track.notes.forEach(note => playableNotes.push(getPlayableNote(note))));
  }

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

  function getPlayableNote(note: Note): PlayableNote {
    return {note, realTime: timeConverter.convertToRealTime(note.timing)};
  }
}
