import {AudioPlayer} from './AudioPlayer.js';
import {TimeConverter} from './TimeConverter.js';

export function ArrangementPlayer(library:Library, arrangement:Arrangement) {
  const noteSource:NoteSource = {getPlayableNotes, library};
  const audioPlayer = AudioPlayer(noteSource);
  const timeConverter:TimeConverter = TimeConverter(arrangement);
  const playableNotes:PlayableNote[] = extractPlayableNotes();
  let isLooping = false;

  return {play, pause, loop};




  // ==================================================================
  //                          Public Functions
  // ==================================================================

  function play() {
    audioPlayer.play();
  }

  function pause() {
    audioPlayer.pause();
  }

  function loop(turnLoopingOn:boolean = true) {
    isLooping = turnLoopingOn;
  }



  // ==================================================================
  //                          Private Functions
  // ==================================================================

  function getPlayableNotes(intervalStart: number, intervalEnd: number): PlayableNote[] {
    const wantedNotes = [];

    if (isLooping) {
      const loopAdjustedIntervals = timeConverter.getLoopAdjustedIntervals(intervalStart, intervalEnd);
      loopAdjustedIntervals.forEach(({loopNumber, intervalStart, intervalEnd}) => {
        for (const note of playableNotes) {
          if (!note.loopsPlayed.includes(loopNumber) && note.realTime >= intervalStart && note.realTime <= intervalEnd) {
            wantedNotes.push(getLoopAdjustedNote(note, loopNumber));
            note.loopsPlayed.push(loopNumber);
          }
        }
      });
    } else {
      for (const note of playableNotes) {
        if (!note.loopsPlayed.includes(0) && note.realTime >= intervalStart && note.realTime <= intervalEnd) {
          wantedNotes.push(note);
          note.loopsPlayed.push(0);
        }
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
    return {
      note,
      realTime: timeConverter.convertToRealTime(note.timing),
      loopsPlayed: []
    };
  }



  function getLoopAdjustedNote(note:PlayableNote, loopNumber:number):PlayableNote {
    return {
      realTime: timeConverter.getLoopAdjustedRealTime(note.realTime, loopNumber),
      note: note.note,
      loopsPlayed: note.loopsPlayed
    };
  }
}
