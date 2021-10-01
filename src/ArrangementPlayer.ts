import {AudioPlayer} from './AudioPlayer.js';
import {TimeConverter} from './TimeConverter.js';

export function ArrangementPlayer() {
  let loadedArrangement: Arrangement|null = null;
  let timeSignature: string|null = null;
  let tempo: number|null = null;
  const playableNotes: PlayableNote[] = [];
  const audioPlayer = AudioPlayer({getPlayableNotes});
  let timeConverter: TimeConverter|null = null;

  return {load, play};


  function load(arrangement: Arrangement) {
    loadedArrangement = arrangement;
    ({timeSignature, tempo} = loadedArrangement);
    timeConverter = TimeConverter(timeSignature, tempo);
    arrangement.tracks.forEach(track => track.notes.forEach(note => playableNotes.push(getPlayableNote(note))));
  }

  function play() {
    audioPlayer.play();
  }

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
