import {AudioPlayer} from './AudioPlayer';
import {TimeConverter} from './TimeConverter';

export function ArrangementPlayer(arrangement:Arrangement): ArrangementPlayer {
  const audioEventSource:AudioEventSource = {get:getAudioEvents};
  const audioPlayer = AudioPlayer(audioEventSource);
  const timeConverter:TimeConverter = TimeConverter(arrangement.timeParams);
  // To prevent playing note-events multiple times,
  // we keep track of which loops we've played them in
  const noteHistory = NotePlayHistory();
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

  // The interval may be beyond the end of the arrangement
  // If we're looping we'll use TimeConverter to resolve it within loops
  function getAudioEvents(interval:Interval): AudioEvent[] {
    const audioEvents: AudioEvent[] = [];

    if (isLooping) {
      const loopIntervals = timeConverter.getLoopIntervals(interval);
      loopIntervals.forEach(loopInterval => {
        const {loopNumber} = loopInterval;
        arrangement.tracks.forEach(track => {
          const noteEvents = track.getNoteEvents(loopInterval);
          for (const noteEvent of noteEvents) {
            if (!noteHistory.check(noteEvent, loopNumber)) {
              audioEvents.push(getAudioEvent(noteEvent, loopNumber));
              noteHistory.record(noteEvent, loopNumber);
            }
          }
        });
      });
    } else {
      arrangement.tracks.forEach(track => {
        const noteEvents = track.getNoteEvents(interval);
        for (const noteEvent of noteEvents) {
          if (!noteHistory.check(noteEvent, 0)) {
            audioEvents.push(getAudioEvent(noteEvent, 0));
            noteHistory.record(noteEvent, 0);
          }
        }
      });
    }

    return audioEvents;
  }




  function getAudioEvent(noteEvent:NoteEvent, loopNumber:number): AudioEvent {
    return {
      realTime: timeConverter.getLoopRealTime(noteEvent.realTime, loopNumber),
      audioBuffer: noteEvent.note.noteStyle.audioBuffer
    };
  }
}




function NotePlayHistory():NotePlayHistory {
  const noteRecords:Map<NoteEvent, number[]> = new Map();

  return {
    record(noteEvent:NoteEvent, loopNumber:number) {
      const noteHistory = getOrCreateHistory(noteEvent);
      noteHistory.push(loopNumber);
    },
    check(noteEvent:NoteEvent, loopNumber:number) {
      const noteHistory = noteRecords.get(noteEvent);
      if (noteHistory)
        return noteHistory.includes(loopNumber);
      return false;
    }
  };

  function getOrCreateHistory(noteEvent:NoteEvent) {
    const existingHistory = noteRecords.get(noteEvent);
    if (existingHistory)
      return existingHistory;
    const noteHistory = [];
    noteRecords.set(noteEvent, noteHistory);
    return noteHistory;
  }
}
