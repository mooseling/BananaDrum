import {TimeCoordinator} from './TimeCoordinator';
import {TrackPlayer} from './TrackPlayer';
import {Publisher} from './Publisher';


export function ArrangementPlayer(arrangement:Banana.Arrangement): Banana.ArrangementPlayer {
  const timeCoordinator = TimeCoordinator(arrangement.timeParams);
  const publisher:Banana.Publisher = Publisher();

  // We need a TrackPlayer for each Track, and add/remove them when needed
  const trackPlayers:{[trackId:string]:Banana.TrackPlayer} = {};
  updateTrackPlayers();
  arrangement.subscribe(updateTrackPlayers);

  // currentTiming updates as we play, and ArrangementPlayer publishes when it does
  let currentTiming:Banana.Timing = {bar:1, step:1};
  let callbackEvents:Banana.CallbackEvent[]|null;
  updateCallbackEvents();
  arrangement.timeParams.subscribe(updateCallbackEvents);

  return {
    arrangement, getEvents, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
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
    const loopIntervals:Banana.LoopInterval[] = timeCoordinator.convertToLoopIntervals(interval);
    const audibleTrackPlayers:Banana.TrackPlayer[] = getAudibleTrackPlayers();

    loopIntervals.forEach(loopInterval => {
      const {loopNumber} = loopInterval;
      audibleTrackPlayers.forEach(({getEvents}) => {
        getEvents(loopInterval).forEach(event => events.push({
          ...event,
          realTime: timeCoordinator.convertToAudioTime(event.realTime, loopNumber)
        }));
      });
    });

    events.push(...getCallbackEvents(interval));

    return events;
  }


  function getAudibleTrackPlayers(): Banana.TrackPlayer[] {
    const soloedTracksPlayers:Banana.TrackPlayer[] = [];
    const unmutedTracksPlayers:Banana.TrackPlayer[] = [];

    for (const trackId in trackPlayers) {
      const trackPlayer = trackPlayers[trackId];
      if (trackPlayer.soloMute === 'solo')
        soloedTracksPlayers.push(trackPlayer);
      else if (trackPlayer.soloMute === null)
        unmutedTracksPlayers.push(trackPlayer);
    }

    if (soloedTracksPlayers.length)
      return soloedTracksPlayers;
    return unmutedTracksPlayers;
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
    // First remove trackPlayers for removed tracks
    for (const trackId in trackPlayers) {
      if (!arrangement.tracks[trackId])
        delete trackPlayers[trackId];
    }

    // Then add trackPlayers for new tracks
    for (const trackId in arrangement.tracks) {
      const track = arrangement.tracks[trackId];
      if (!trackPlayers[trackId])
        trackPlayers[trackId] = TrackPlayer(track, timeCoordinator);
    }
  }


  function updateCallbackEvents() {
    callbackEvents = arrangement.timeParams.timings.map(timing => ({
      realTime: timeCoordinator.convertToRealTime(timing),
      callback: () => {
        currentTiming = timing;
        publisher.publish();
      },
      identifier: timing
    }));
  }
}
