// The core of Banana Drum is the EventEngine
// It plays audio and fires callbacks at the right time
// Playing audio boils down to the WebAudio API, so we must warp our design around that

import {Publisher} from './Publisher';
import {AudioBufferPlayer} from './AudioBufferPlayer';

const lookahead = 0.25; // (s) Look 250ms ahead for events
const loopFrequency = 125 // (ms) Check for upcoming events every 125ms

export const EventEngine:Banana.EventEngine = (function(){
  const audioContext:AudioContext = new AudioContext();
  audioContext.suspend();
  const eventSources:Banana.EventSource[] = [];
  let nextIteration: number|null = null;
  let timeCovered:number = 0;
  let offset:number = 0;
  let state:Banana.EventEngineState = 'stopped';
  const publisher:Banana.Publisher = Publisher();


  type AudioEventReference =  {audioEvent:Banana.AudioEvent, audioBufferPlayer:Banana.AudioBufferPlayer};
  const scheduledAudioEvents:AudioEventReference[] = [];

  type CallbackEventReference = {callbackEvent:Banana.CallbackEvent, timeoutId:number};
  const scheduledCallbackEvents:CallbackEventReference[] = [];

  type MuteEventReference = {muteEvent:Banana.MuteEvent, timeoutId:number};
  const scheduledMuteEvents:MuteEventReference[] = [];



  return {
    connect, play, stop, getTime, playSound,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get state():Banana.EventEngineState {
      return state;
    }
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  function connect(eventSource:Banana.EventSource) {
    eventSources.push(eventSource);
  }


  async function play() {
    await ensureContextIsRunning();
    if (nextIteration === null) {
      loop();
      state = 'playing';
      publisher.publish();
    }
  }


  function stop() {
    if (nextIteration !== null) {
      audioContext.suspend();
      clearScheduledEvents();
      clearTimeout(nextIteration);
      nextIteration = null;
      timeCovered = audioContext.currentTime;
      offset = timeCovered;
      state = 'stopped';
      publisher.publish();
    }
  }


  function getTime() {
    return audioContext.currentTime - offset;
  }


  function playSound(audioBuffer:AudioBuffer, time = 0): Banana.AudioBufferPlayer {
    const audioBufferPlayer = AudioBufferPlayer(audioBuffer, audioContext, time);
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
    const currentTime = audioContext.currentTime;
    const interval:Banana.Interval = {start:timeCovered - offset, end: currentTime + lookahead - offset};
    scheduleEvents(interval);
    nextIteration = setTimeout(loop, loopFrequency);
    timeCovered = currentTime + lookahead;
  }


  function scheduleEvents(interval:Banana.Interval) {
    eventSources.forEach(eventSource => {
      eventSource.getEvents(interval).forEach(event => {
        if ('audioBuffer' in event)
          scheduleAudioEvent(event as Banana.AudioEvent);
        if ('callback' in event)
          scheduleCallbackEvent(event as Banana.CallbackEvent);
        if ('muteFilter' in event)
          scheduleMuteEvent(event as Banana.MuteEvent);
      });
    });
  }


  function scheduleAudioEvent(audioEvent:Banana.AudioEvent) {
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


  function scheduleCallbackEvent(callbackEvent:Banana.CallbackEvent) {
    const msFromNow = (callbackEvent.realTime - audioContext.currentTime + offset) * 1000;
    const callbackEventReference:CallbackEventReference = {
      callbackEvent,
      timeoutId: setTimeout(() => {
        callbackEvent.callback();
        removeFromCallbackSchedule(callbackEventReference);
      }, msFromNow)
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


  function scheduleMuteEvent(muteEvent:Banana.MuteEvent) {
    const msFromNow = (muteEvent.realTime - audioContext.currentTime + offset) * 1000;
    const scheduledMuteEvent = {
      muteEvent,
      timeoutId: setTimeout(() => {
        muteUsingFilter(muteEvent.muteFilter)
        removeFromMuteSchedule(scheduledMuteEvent);
      }, msFromNow)
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


  function muteUsingFilter(muteFilter:Banana.MuteFilter) {
    scheduledAudioEvents.forEach(audioEventReference => {
      if (audioEventReference.audioEvent.realTime <= getTime() && muteFilter(audioEventReference.audioEvent))
        stopAudioAndUnschedule(audioEventReference);
    });
  }
})();
