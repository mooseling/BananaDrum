import {TimeCoordinator} from './TimeCoordinator';
import {TrackPlayer} from './TrackPlayer';


export function ArrangementPlayer(arrangement:Banana.Arrangement): Banana.ArrangementPlayer {
  const timeCoordinator = TimeCoordinator(arrangement.timeParams);
  let isLooping = false;
  let subscriptions: Banana.Subscription[] = [];

  // We need a TrackPlayer for each Track, and add/remove them when needed
  const trackPlayers:{[trackId:string]:Banana.TrackPlayer} = {};
  updateTrackPlayers();
  arrangement.subscribe(updateTrackPlayers);

  // currentTiming updates as we play, and ArrangementPlayer publishes when it does
  let currentTiming:Banana.Timing = '1.1.1';
  let callbackEvents:Banana.CallbackEvent[]|null;
  updateCallbackEvents();
  arrangement.timeParams.subscribe(updateCallbackEvents);

  return {
    arrangement, getEvents, loop, subscribe,
    get currentTiming() {
      return currentTiming;
    }
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  // The interval may be beyond the end of the arrangement
  // If we're looping we'll use TimeConverter to resolve it within loops
  function getEvents(interval:Banana.Interval): Banana.Event[] {
    const events:Banana.Event[] = [];
    const loopIntervals:Banana.LoopInterval[] = isLooping ?
      timeCoordinator.convertToLoopIntervals(interval) :
      timeCoordinator.convertToLoopIntervals(interval).filter(({loopNumber}) => loopNumber === 0);

    loopIntervals.forEach(loopInterval => {
      const {loopNumber} = loopInterval;
      for (const trackId in trackPlayers) {
        trackPlayers[trackId].getEvents(loopInterval)
          .forEach(event => events.push({
            ...event,
            realTime: timeCoordinator.convertToAudioTime(event.realTime, loopNumber)
          }));
      }
    });

    events.push(...getCallbackEvents(interval));

    return events;
  }


  function getCallbackEvents(interval:Banana.Interval): Banana.CallbackEvent[] {
    const eventsInInterval:Banana.CallbackEvent[] = [];
    const loopIntervals:Banana.LoopInterval[] = isLooping ?
      timeCoordinator.convertToLoopIntervals(interval) :
      timeCoordinator.convertToLoopIntervals(interval).filter(({loopNumber}) => loopNumber === 0);

    loopIntervals.forEach(({loopNumber, start, end}) => {
      callbackEvents.filter(({realTime}) => realTime >= start && realTime < end)
        .forEach(audioEvent => eventsInInterval.push({
          ...audioEvent,
          realTime: timeCoordinator.convertToAudioTime(audioEvent.realTime, loopNumber)
        }))
    });

    return eventsInInterval;
  }


  function loop(turnLoopingOn:boolean = true) {
    isLooping = turnLoopingOn;
  }


  function subscribe(callback: Banana.Subscription) {
    subscriptions.push(callback);
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function updateTrackPlayers(): void {
    // First remove trackPlayers for removed tracks
    for (const trackId in trackPlayers) {
      if (!arrangement.tracks[trackId])
        delete trackPlayers[trackId];
    }

    // Then add trackPlayers for new tracks
    for (const trackId in arrangement.tracks) {
      if (!trackPlayers[trackId])
        trackPlayers[trackId] = TrackPlayer(arrangement.tracks[trackId], timeCoordinator);
    }
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
    subscriptions.forEach(callback => callback());
  }
}
