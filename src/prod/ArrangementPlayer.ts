import {AudioPlayer} from './AudioPlayer';
import {Offsetter} from './Offsetter';
import {TimeConverter} from './TimeConverter';
import {TrackPlayer} from './TrackPlayer';


export function ArrangementPlayer(arrangement:Arrangement): ArrangementPlayer {
  const offsetter = Offsetter(arrangement.timeParams.tempo);
  let timeConverter:TimeConverter = TimeConverter(arrangement.timeParams);
  arrangement.timeParams.subscribe(handleTimeParamsChange);
  let isLooping = false;
  const trackPlayers:TrackPlayer[] = createTrackPlayers();

  return {getAudioEvents, loop};






  // ==================================================================
  //                          Public Functions
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
      trackPlayers.forEach(trackPlayer =>
        trackPlayer.getAudioEvents(loopInterval)
        .forEach(audioEvent => audioEvents.push(adjustAudioEvent(audioEvent, loopNumber)))
      );
    });

    return audioEvents;
  }


  function loop(turnLoopingOn:boolean = true) {
    isLooping = turnLoopingOn;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function adjustAudioEvent(audioEvent:AudioEvent, loopNumber:number): AudioEvent {
    return {
      ...getIdentifiedAudioEvent(audioEvent, loopNumber),
      realTime: offsetter.unoffset(timeConverter.getLoopRealTime(audioEvent.realTime, loopNumber))
    };
  }


  // AudioEvents coming out of arrangements are uniquely identified from the arrangement's perspective
  // We'll extend the identifier so they are uniquely identified within the arrangement-player
  function getIdentifiedAudioEvent(audioEvent:AudioEvent, loopNumber:number): AudioEvent {
    const identifier = `${audioEvent.identifier}--${loopNumber}`;
    return  {...audioEvent, identifier};
  }


  function handleTimeParamsChange() {
    timeConverter = TimeConverter(arrangement.timeParams);
    offsetter.update(arrangement.timeParams.tempo, AudioPlayer.getTime());
  }


  function createTrackPlayers() {
    return arrangement.tracks.map(track => TrackPlayer(track));
  }
}
