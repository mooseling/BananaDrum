import {AudioPlayer} from './AudioPlayer';
import {Offsetter} from './Offsetter';
import {TimeConverter} from './TimeConverter';

export function ArrangementPlayer(arrangement:Arrangement): ArrangementPlayer {
  const audioEventSource:AudioEventSource = {getAudioEvents};
  const audioPlayer = AudioPlayer(audioEventSource);
  const offsetter = Offsetter(arrangement.timeParams.tempo);
  let timeConverter:TimeConverter = TimeConverter(arrangement.timeParams);
  arrangement.timeParams.subscribe(handleTimeParamsChange);
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
}
