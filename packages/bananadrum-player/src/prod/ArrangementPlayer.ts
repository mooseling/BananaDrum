import { ArrangementView, RealTime, Timing, TrackView } from 'bananadrum-core';
import { createPublisher } from 'bananadrum-core';
import { createTimeCoordinator } from './TimeCoordinator.js';
import { createTrackPlayer } from './TrackPlayer.js';
import { ArrangementPlayer, CallbackEvent, Event, Interval, LoopInterval, TrackPlayer } from './types.js';



export function createArrangementPlayer(arrangement:ArrangementView): ArrangementPlayer {
  const timeCoordinator = createTimeCoordinator(arrangement.timeParams);
  const publisher = createPublisher();
  const currentTimingPublisher = createPublisher();
  const audibleTrackPlayersPublisher = createPublisher();

  // We need a TrackPlayer for each Track, and add/remove them when needed
  const trackPlayers:Map<TrackView, TrackPlayer> = new Map();
  const audibleTrackPlayers:Map<TrackView, TrackPlayer> = new Map();
  updateTrackPlayers();
  updateAudibleTrackPlayers();
  arrangement.subscribe(updateTrackPlayers);

  // currentTiming updates as we play, and ArrangementPlayer publishes when it does
  let currentTiming:Timing = null;
  let callbackEvents:CallbackEvent[]|null;
  updateCallbackEvents();
  arrangement.timeParams.subscribe(updateCallbackEvents);

  return {
    arrangement, getEvents, onStop, trackPlayers,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get currentTiming() {
      return currentTiming;
    },
    convertToLoopProgress(realTime:RealTime) {
      return timeCoordinator.convertToLoopProgress(realTime);
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
  function getEvents(interval:Interval): Event[] {
    const events:Event[] = [];
    const loopIntervals:LoopInterval[] = timeCoordinator.convertToLoopIntervals(interval);

    loopIntervals.forEach(loopInterval => {
      const {loopNumber} = loopInterval;
      audibleTrackPlayers.forEach(trackPlayer => {
        trackPlayer.getEvents(loopInterval).forEach(event => events.push({
          ...event,
          realTime: timeCoordinator.convertToAudioTime(event.realTime, loopNumber)
        }));
      });
    });

    events.push(...getCallbackEvents(interval));

    return events;
  }


  function getCallbackEvents(interval:Interval): CallbackEvent[] {
    const eventsInInterval:CallbackEvent[] = [];
    const loopIntervals:LoopInterval[] = timeCoordinator.convertToLoopIntervals(interval);

    loopIntervals.forEach(({loopNumber, start, end}) => {
      callbackEvents.filter(({realTime}) => realTime >= start && realTime < end)
        .forEach(audioEvent => eventsInInterval.push({
          ...audioEvent,
          realTime: timeCoordinator.convertToAudioTime(audioEvent.realTime, loopNumber)
        }))
    });

    return eventsInInterval;
  }


  function onStop() {
    currentTiming = null;
    currentTimingPublisher.publish();
    trackPlayers.forEach(trackPlayer => trackPlayer.onStop());
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function updateTrackPlayers(): void {
    let somethingChanged = false;

    // First remove trackPlayers for removed tracks
    trackPlayers.forEach(trackPlayer => {
      if (!arrangement.tracks.includes(trackPlayer.track)) {
        trackPlayer.unsubscribe(updateAudibleTrackPlayers);
        trackPlayers.delete(trackPlayer.track);
        audibleTrackPlayers.delete(trackPlayer.track);
        somethingChanged = true;
      }
    });

    // Then add trackPlayers for new tracks
    arrangement.tracks.forEach(track => {
      if (!trackPlayers.get(track)) {
        const trackPlayer = createTrackPlayer(track, timeCoordinator)
        trackPlayers.set(track, trackPlayer);
        trackPlayer.subscribe(updateAudibleTrackPlayers);
        somethingChanged = true;
      }
    });

    if (somethingChanged) {
      updateAudibleTrackPlayers();
      publisher.publish();
    }
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




  function updateAudibleTrackPlayers(): void {
    const calculatedAudibleTrackPlayers = calculateAudibleTrackPlayers(trackPlayers);

    let somethingChanged = false;

    for (const track of trackPlayers.keys()) {
      if (calculatedAudibleTrackPlayers.includes(trackPlayers.get(track))) {
        audibleTrackPlayers.set(track, trackPlayers.get(track));
        somethingChanged = true;
      } else {
        audibleTrackPlayers.delete(track);
        somethingChanged = true;
      }
    }

    if (somethingChanged)
      audibleTrackPlayersPublisher.publish();
  }
}


function calculateAudibleTrackPlayers(trackPlayers:Map<TrackView, TrackPlayer>): TrackPlayer[] {
  const soloedTracksPlayers:TrackPlayer[] = [];
  const unmutedTracksPlayers:TrackPlayer[] = [];

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
