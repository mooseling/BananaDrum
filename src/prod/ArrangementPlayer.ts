import {TimeCoordinator} from './TimeCoordinator';
import {TrackPlayer} from './TrackPlayer';


export function ArrangementPlayer(arrangement:Arrangement): ArrangementPlayer {
  const timeCoordinator = TimeCoordinator(arrangement.timeParams);
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
    const loopIntervals:LoopInterval[] = isLooping ?
      timeCoordinator.convertToLoopIntervals(interval) :
      timeCoordinator.convertToLoopIntervals(interval).filter(({loopNumber}) => loopNumber === 0);

    loopIntervals.forEach(loopInterval => {
      const {loopNumber} = loopInterval;
      trackPlayers.forEach(trackPlayer =>
        trackPlayer.getAudioEvents(loopInterval)
        .forEach(audioEvent => audioEvents.push({
          ...getIdentifiedAudioEvent(audioEvent, loopNumber),
          realTime: timeCoordinator.convertToAudioTime(audioEvent.realTime, loopNumber)
        }))
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



  // AudioEvents coming out of tracks are uniquely identified from the track's perspective
  // We'll extend the identifier so they are uniquely identified within the arrangement-player
  function getIdentifiedAudioEvent(audioEvent:AudioEvent, loopNumber:number): AudioEvent {
    const {instrumentId} = audioEvent.note.track.instrument;
    const identifier = `${audioEvent.identifier}--${loopNumber}_${instrumentId}`;
    return  {...audioEvent, identifier};
  }


  function createTrackPlayers() {
    return arrangement.tracks.map(track => TrackPlayer(track, timeCoordinator));
  }
}
