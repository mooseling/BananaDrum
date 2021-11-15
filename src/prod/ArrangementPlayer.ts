import {AudioPlayer} from './AudioPlayer';
import {Offsetter} from './Offsetter';
import {TimeConverter} from './TimeConverter';

export function ArrangementPlayer(arrangement:Arrangement): ArrangementPlayer {
  const audioEventSource:AudioEventSource = {getAudioEvents};
  const audioPlayer = AudioPlayer(audioEventSource);
  const offsetter = Offsetter(arrangement.timeParams.tempo);
  let timeConverter:TimeConverter = TimeConverter(arrangement.timeParams);
  arrangement.timeParams.subscribe(handleTimeParamsChange);
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
    const audioEvents:AudioEvent[] = [];
    const offsetInterval = offsetter.getInterval(interval);

    const loopIntervals:LoopInterval[] = isLooping ?
      timeConverter.getLoopIntervals(offsetInterval) :
      [{...interval, loopNumber:0}];
    loopIntervals.forEach(loopInterval => {
      const {loopNumber} = loopInterval;
      arrangement.getAudioEvents(loopInterval).forEach(audioEvent => {
        if (!noteHistory.check(audioEvent, loopNumber)) {
          audioEvents.push(adjustAudioEvent(audioEvent, loopNumber));
          noteHistory.record(audioEvent, loopNumber);
        }
      });
    });

    return audioEvents;
  }




  function adjustAudioEvent(audioEvent:AudioEvent, loopNumber:number): AudioEvent {
    return {
      realTime: offsetter.unoffset(timeConverter.getLoopRealTime(audioEvent.realTime, loopNumber)),
      audioBuffer: audioEvent.audioBuffer,
      note:audioEvent.note
    };
  }


  function handleTimeParamsChange() {
    timeConverter = TimeConverter(arrangement.timeParams);
    offsetter.update(arrangement.timeParams.tempo, audioPlayer.getTime());
  }
}

// To prevent double-playing notes, we keep track of which ones we've already provided
// We will be moving this functionality down into AudioPlayer soon
interface NotePlayHistory {
  record(audioEvent:AudioEvent, loopNumber:number): void
  check(audioEvent:AudioEvent, loopNumber:number): boolean
}

function NotePlayHistory():NotePlayHistory {
  const noteRecords:Map<AudioEvent, number[]> = new Map();

  return {
    record(audioEvent:AudioEvent, loopNumber:number) {
      const noteHistory = getOrCreateHistory(audioEvent);
      noteHistory.push(loopNumber);
    },
    check(audioEvent:AudioEvent, loopNumber:number) {
      const noteHistory = noteRecords.get(audioEvent);
      if (noteHistory)
        return noteHistory.includes(loopNumber);
      return false;
    }
  };

  function getOrCreateHistory(audioEvent:AudioEvent) {
    const existingHistory = noteRecords.get(audioEvent);
    if (existingHistory)
      return existingHistory;
    const noteHistory = [];
    noteRecords.set(audioEvent, noteHistory);
    return noteHistory;
  }
}
