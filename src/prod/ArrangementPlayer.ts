import {TimeCoordinator} from './TimeCoordinator';
import {TrackPlayer} from './TrackPlayer';
import {Publisher} from './Publisher';

type TrackPlayers = {[trackId:string]: Banana.TrackPlayer}


export function ArrangementPlayer(arrangement:Banana.Arrangement): Banana.ArrangementPlayer {
  const timeCoordinator = TimeCoordinator(arrangement.timeParams);
  const publisher:Banana.Publisher = Publisher();
  const currentTimingPublisher = Publisher();
  const audibleTrackPlayersPublisher = Publisher();

  // We need a TrackPlayer for each Track, and add/remove them when needed
  const trackPlayers:TrackPlayers = {};
  const audibleTrackPlayers:TrackPlayers = {};
  const trackPlayerSubscriptions:{[trackId:string]:Banana.Subscription} = {};
  updateTrackPlayers();
  updateAudibleTrackPlayers(trackPlayers, audibleTrackPlayers);
  arrangement.subscribe(updateTrackPlayers);

  // currentTiming updates as we play, and ArrangementPlayer publishes when it does
  let currentTiming:Banana.Timing = {bar:1, step:1};
  let callbackEvents:Banana.CallbackEvent[]|null;
  updateCallbackEvents();
  arrangement.timeParams.subscribe(updateCallbackEvents);

  return {
    arrangement, getEvents, trackPlayers,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get currentTiming() {
      return currentTiming;
    },
    currentTimingPublisher: {
      subscribe: currentTimingPublisher.subscribe,
      unsubscribe: currentTimingPublisher.unsubscribe
    },
    audibleTrackPlayers,
    audibleTrackPlayersPublisher: {
      subscribe: audibleTrackPlayersPublisher.subscribe,
      unsubscribe: audibleTrackPlayersPublisher.unsubscribe
    }
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  // The interval may be beyond the end of the arrangement
  // If we're looping we'll use TimeConverter to resolve it within loops
  function getEvents(interval:Banana.Interval): Banana.Event[] {
    const events:Banana.Event[] = [];
    const loopIntervals:Banana.LoopInterval[] = timeCoordinator.convertToLoopIntervals(interval);

    loopIntervals.forEach(loopInterval => {
      const {loopNumber} = loopInterval;
      for (const trackId in audibleTrackPlayers) {
        trackPlayers[trackId].getEvents(loopInterval).forEach(event => events.push({
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
    const loopIntervals:Banana.LoopInterval[] = timeCoordinator.convertToLoopIntervals(interval);

    loopIntervals.forEach(({loopNumber, start, end}) => {
      callbackEvents.filter(({realTime}) => realTime >= start && realTime < end)
        .forEach(audioEvent => eventsInInterval.push({
          ...audioEvent,
          realTime: timeCoordinator.convertToAudioTime(audioEvent.realTime, loopNumber)
        }))
    });

    return eventsInInterval;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function updateTrackPlayers(): void {
    let somethingChanged = false;
    // First remove trackPlayers for removed tracks
    for (const trackId in trackPlayers) {
      if (!arrangement.tracks[trackId]) {
        trackPlayers[trackId].unsubscribe(trackPlayerSubscriptions[trackId]);
        delete trackPlayerSubscriptions[trackId];
        delete trackPlayers[trackId];
        somethingChanged = true;
      }
    }

    // Then add trackPlayers for new tracks
    for (const trackId in arrangement.tracks) {
      const track = arrangement.tracks[trackId];
      if (!trackPlayers[trackId]) {
        trackPlayers[trackId] = TrackPlayer(track, timeCoordinator);
        trackPlayers[trackId].subscribe(getNewSubscription(trackId));
        somethingChanged = true;
      }
    }

    updateAudibleTrackPlayers(trackPlayers, audibleTrackPlayers);

    if (somethingChanged)
      publisher.publish();
  }


  function getNewSubscription(trackId:string): Banana.Subscription {
    if (trackPlayerSubscriptions[trackId])
      throw 'Trying to subscribe to a TrackPlayer but already subscribed';
    const subscription = () => {
      updateAudibleTrackPlayers(trackPlayers, audibleTrackPlayers);
      audibleTrackPlayersPublisher.publish();
    };
    trackPlayerSubscriptions[trackId] = subscription;
    return subscription;
  }


  function updateCallbackEvents() {
    callbackEvents = arrangement.timeParams.timings.map(timing => ({
      realTime: timeCoordinator.convertToRealTime(timing),
      callback: () => {
        currentTiming = timing;
        currentTimingPublisher.publish();
      },
      identifier: timing
    }));
  }
}


export function updateAudibleTrackPlayers(trackPlayers:TrackPlayers, target:TrackPlayers) {
  const audibleTrackPlayers = getAudibleTrackPlayers(Object.values(trackPlayers));

  for (const trackId in trackPlayers) {
    const trackPlayer = trackPlayers[trackId];
    if (audibleTrackPlayers.includes(trackPlayer))
      target[trackId] = trackPlayer;
    else if (target[trackId])
      delete target[trackId];
  }
}


function getAudibleTrackPlayers(trackPlayers:Banana.TrackPlayer[]): Banana.TrackPlayer[] {
  const soloedTracksPlayers:Banana.TrackPlayer[] = [];
  const unmutedTracksPlayers:Banana.TrackPlayer[] = [];

  trackPlayers.forEach(trackPlayer => {
    if (trackPlayer.soloMute === 'solo')
      soloedTracksPlayers.push(trackPlayer);
    else if (trackPlayer.soloMute === null)
      unmutedTracksPlayers.push(trackPlayer);
  });

  if (soloedTracksPlayers.length)
    return soloedTracksPlayers;
  return unmutedTracksPlayers;
}
