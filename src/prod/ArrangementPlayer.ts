import {TimeCoordinator} from './TimeCoordinator';
import {TrackPlayer} from './TrackPlayer';


export function ArrangementPlayer(arrangement:Arrangement): ArrangementPlayer {
  const timeCoordinator = TimeCoordinator(arrangement.timeParams);
  let isLooping = false;
  const trackPlayers:TrackPlayer[] = createTrackPlayers();
  let subscribers: ((...args:any[]) => void)[] = [];

  // currentTiming updates as we play, and ArrangementPlayer publishes when it does
  let currentTiming:Timing = '1.1.1';
  let callbackEvents:CallbackEvent[]|null;
  updateCallbackEvents();
  arrangement.timeParams.subscribe(updateCallbackEvents);

  return {
    getAudioEvents, getCallbackEvents, loop, subscribe,
    get currentTiming() {
      return currentTiming;
    }
  };






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


  function getCallbackEvents(interval:Interval): CallbackEvent[] {
    const eventsInInterval:CallbackEvent[] = [];
    const loopIntervals:LoopInterval[] = isLooping ?
      timeCoordinator.convertToLoopIntervals(interval) :
      timeCoordinator.convertToLoopIntervals(interval).filter(({loopNumber}) => loopNumber === 0);

    loopIntervals.forEach(({loopNumber, start, end}) => {
      callbackEvents.filter(({realTime}) => realTime >= start && realTime < end)
        .forEach(audioEvent => eventsInInterval.push({
          ...getIdentifiedCallbackEvent(audioEvent, loopNumber),
          realTime: timeCoordinator.convertToAudioTime(audioEvent.realTime, loopNumber)
        }))
    });

    return eventsInInterval;
  }


  function loop(turnLoopingOn:boolean = true) {
    isLooping = turnLoopingOn;
  }


  function subscribe(callback: (...args:any[]) => void) {
    subscribers.push(callback);
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


  // CallbackEvents are already tagged with their timing, they just need loopNumber
  function getIdentifiedCallbackEvent(callbackEvent:CallbackEvent, loopNumber:number): CallbackEvent {
    const identifier = `${callbackEvent.identifier}--${loopNumber}`;
    return  {...callbackEvent, identifier};
  }


  function createTrackPlayers() {
    return arrangement.tracks.map(track => TrackPlayer(track, timeCoordinator));
  }


  function updateCallbackEvents() {
    const sixteenths = arrangement.getSixteenths();
    callbackEvents = sixteenths.map(timing => ({
      realTime: timeCoordinator.convertToRealTime(timing),
      callback: () => {
        currentTiming = timing;
        publish();
      },
      identifier: timing
    }));
  }


  function publish(): void {
    subscribers.forEach(callback => callback());
  }
}
