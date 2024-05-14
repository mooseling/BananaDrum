import { AudioEvent, CallbackEvent, EventEngineState, EventEngine, Interval, MuteEvent, EventSource, MuteFilter } from './types';
import { createPublisher } from 'bananadrum-core';
import { AudioBufferPlayer, createAudioBufferPlayer } from './AudioBufferPlayer.js';


// The core of the Banana Drum Player is the EventEngine
// It plays audio and fires callbacks at the right time
// Playing audio boils down to the WebAudio API, so we must warp our design around that


const lookahead = 0.25; // (s) Look 250ms ahead for events
const loopFrequency = 125 // (ms) Check for upcoming events every 125ms


export function getEventEngine(): EventEngine {
  return eventEngine;
}


const eventEngine:EventEngine = (function(){
  const audioContext:AudioContext = new AudioContext();
  const eventSources:EventSource[] = [];
  let nextIterationId: number|null = null;
  let state:EventEngineState = 'stopped';
  const publisher = createPublisher();

  // We use the AudioContext to move forward in time
  // But it always moves forward, even when the EventEngine is stopped
  // This means the AudioContext is way ahead in time
  // So we maintain an offset to calculate EventEngine time from AudioContext time
  let offset = 0;

  // We ask for events in time-intervals, but never ask for time we've already covered
  let timeCovered = 0;


  type AudioEventReference =  {audioEvent:AudioEvent, audioBufferPlayer:AudioBufferPlayer};
  const scheduledAudioEvents:AudioEventReference[] = [];

  type CallbackEventReference = {callbackEvent:CallbackEvent, timeoutId:number};
  const scheduledCallbackEvents:CallbackEventReference[] = [];

  type MuteEventReference = {muteEvent:MuteEvent, timeoutId:number};
  const scheduledMuteEvents:MuteEventReference[] = [];



  return {
    connect, play, stop, getTime,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get state():EventEngineState {
      return state;
    }
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  function connect(eventSource:EventSource) {
    eventSources.push(eventSource);
  }


  async function play() {
    await ensureContextIsRunning();
    if (nextIterationId === null) {
      offset = audioContext.currentTime; // should always have timeCovered = 0 at this point
      loop();
      state = 'playing';
      publisher.publish();
    }
  }


  function stop() {
    if (nextIterationId !== null) {
      clearScheduledEvents();
      clearTimeout(nextIterationId);
      nextIterationId = null;
      timeCovered = 0;
      state = 'stopped';
      callOnStopCallbacks();
      publisher.publish();
    }
  }


  function getTime() {
    if (state === 'playing')
      return audioContext.currentTime - offset;
    return 0;
  }


  function playSound(audioBuffer:AudioBuffer, time = 0): AudioBufferPlayer {
    const audioBufferPlayer = createAudioBufferPlayer(audioBuffer, audioContext, time);
    return audioBufferPlayer;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  async function ensureContextIsRunning() {
    if (audioContext.state !== 'running') {
      await audioContext.resume();

      // @ts-ignore
      if (audioContext.state !== 'running')
        throw "Couldn't start the AudioContext";
    }
  }


  // The loop is a setTimeout loop
  // It gets and schedules events in an upcoming time interval
  // We make sure never to request any time we've requested before
  function loop() {
    const intervalEnd = getTime() + lookahead;
    const interval:Interval = {start:timeCovered, end: intervalEnd};
    scheduleEvents(interval);
    nextIterationId = setTimeout(loop, loopFrequency);
    timeCovered = intervalEnd;
  }


  function scheduleEvents(interval:Interval) {
    eventSources.forEach(eventSource => {
      eventSource.getEvents(interval).forEach(event => {
        if ('audioBuffer' in event)
          scheduleAudioEvent(event as AudioEvent);
        if ('callback' in event)
          scheduleCallbackEvent(event as CallbackEvent);
        if ('muteFilter' in event)
          scheduleMuteEvent(event as MuteEvent);
      });
    });
  }


  function scheduleAudioEvent(audioEvent:AudioEvent) {
    const audioBufferPlayer = playSound(audioEvent.audioBuffer, audioEvent.realTime + offset);
    const audioEventReference:AudioEventReference = {audioEvent, audioBufferPlayer};
    scheduledAudioEvents.push(audioEventReference);
    // Event listener will fire on context.suspend() as well as audiobuffer finishing
    // The 'stop' button wants to clear audio that's in mid-play
    audioBufferPlayer.onEnded(() => stopAudioAndUnschedule(audioEventReference));
  }


  function stopAudioAndUnschedule(audioEventReference:AudioEventReference) {
    audioEventReference.audioBufferPlayer.stop();
    const scheduleIndex = scheduledAudioEvents.indexOf(audioEventReference);
    if (scheduleIndex !== -1)
      scheduledAudioEvents.splice(scheduleIndex, 1);
  }


  function scheduleCallbackEvent(callbackEvent:CallbackEvent) {
    const callbackEventReference:CallbackEventReference = {
      callbackEvent,
      timeoutId: setTimeout(() => {
        callbackEvent.callback();
        removeFromCallbackSchedule(callbackEventReference);
      }, getMsFromNow(callbackEvent.realTime))
    };
    scheduledCallbackEvents.push(callbackEventReference);
  }


  function removeFromCallbackSchedule(callbackEventReference:CallbackEventReference) {
    const scheduleIndex = scheduledCallbackEvents.indexOf(callbackEventReference);
    if (scheduleIndex !== -1)
      scheduledCallbackEvents.splice(scheduleIndex, 1);
    // Currently no need to clearTimeout on callback events
    // They are only getting unscheduled by this function after they fire
    // They are also getting unscheduled by clearScheduledEvents, which does clearTimeout
  }


  function scheduleMuteEvent(muteEvent:MuteEvent) {
    const scheduledMuteEvent = {
      muteEvent,
      timeoutId: setTimeout(() => {
        muteUsingFilter(muteEvent.muteFilter)
        removeFromMuteSchedule(scheduledMuteEvent);
      }, getMsFromNow(muteEvent.realTime))
    };
    scheduledMuteEvents.push(scheduledMuteEvent)
  }


  function removeFromMuteSchedule(muteEventReference:MuteEventReference) {
    const scheduleIndex = scheduledMuteEvents.indexOf(muteEventReference);
    if (scheduleIndex !== -1)
      scheduledMuteEvents.splice(scheduleIndex, 1);
  }


  function clearScheduledEvents(): void {
    scheduledAudioEvents.forEach(({audioBufferPlayer}) => audioBufferPlayer.stop());
    scheduledCallbackEvents.forEach(({timeoutId}) => clearTimeout(timeoutId));
    scheduledMuteEvents.forEach(({timeoutId}) => clearTimeout(timeoutId));
    scheduledAudioEvents.splice(0);
    scheduledCallbackEvents.splice(0);
    scheduledMuteEvents.splice(0);
  }


  function callOnStopCallbacks() {
    eventSources.forEach(({onStop}) => (onStop && onStop()));
  }


  function getMsFromNow(time:number) {
    return (time - getTime()) * 1000;
  }


  function muteUsingFilter(muteFilter:MuteFilter) {
    scheduledAudioEvents
      .filter(audioEventReference => hasStarted(audioEventReference) && muteFilter(audioEventReference.audioEvent))
      .forEach(stopAudioAndUnschedule);
  }


  function hasStarted(audioEventReference:AudioEventReference): boolean {
    return audioEventReference.audioEvent.realTime <= getTime();
  }
})();
