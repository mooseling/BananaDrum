// The core of Banana Drum is the EventEngine
// It plays audio and fires callbacks at the right time
// Playing audio boils down to the WebAudio API, so we must warp our design around that

import {Publisher} from './Publisher';

const lookahead = 0.25; // (s) Look 250ms ahead for events
const loopFrequency = 125 // (ms) Check for upcoming events every 125ms

export const EventEngine:Banana.EventEngine = (function(){
  let playbackAudioContext:AudioContext|null = null;
  let oneOffAudioContext:AudioContext|null = null;
  const eventSources:Banana.EventSource[] = [];
  let nextIteration: number|null = null;
  let timeCovered:number = 0;
  let offset:number = 0; // We offset playback to 0 to stop
  let state:Banana.EventEngineState = 'stopped';
  const publisher:Banana.Publisher = Publisher();


  type AudioEventReference =  {audioEvent:Banana.AudioEvent, sourceNode:AudioBufferSourceNode};
  const scheduledAudioEvents:AudioEventReference[] = [];

  type CallbackEventReference = {callbackEvent:Banana.CallbackEvent, timeoutId:number};
  const scheduledCallbackEvents:CallbackEventReference[] = [];

  type MuteEventReference = {muteEvent:Banana.MuteEvent, timeoutId:number};
  const scheduledMuteEvents:MuteEventReference[] = [];



  return {
    initialise, connect, play, pause, getTime, playSound,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get state():Banana.EventEngineState {
      return state;
    }
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  // Browsers require that an AudioContext is created as a result of user interaction
  function initialise() {
    if (playbackAudioContext === null) {
      playbackAudioContext = new AudioContext();
      playbackAudioContext.suspend();
      oneOffAudioContext = new AudioContext();
    }
  }


  function connect(eventSource:Banana.EventSource) {
    eventSources.push(eventSource);
  }


  function play() {
    checkInitialised();
    if (nextIteration === null) {
      playbackAudioContext.resume();
      loop();
      state = 'playing';
      publisher.publish();
    }
  }


  function pause() {
    if (nextIteration !== null) {
      playbackAudioContext.suspend();
      clearScheduledEvents();
      clearTimeout(nextIteration);
      nextIteration = null;
      timeCovered = playbackAudioContext.currentTime;
      offset = timeCovered;
      state = 'paused';
      publisher.publish();
    }
  }


  function getTime() {
    checkInitialised();
    return playbackAudioContext.currentTime - offset;
  }


  function playSound(audioBuffer:AudioBuffer, time = 0): AudioBufferSourceNode {
    let context = time === 0 ? oneOffAudioContext : playbackAudioContext;
    const sourceNode = new AudioBufferSourceNode(context, {buffer:audioBuffer});
    sourceNode.connect(context.destination);
    sourceNode.start(time);
    return sourceNode;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function checkInitialised() {
    if (playbackAudioContext === null)
      throw 'The AudioPlayer has not been initialised';
  }


  // The loop is a setTimeout loop
  // It gets and schedules events in an upcoming time interval
  // We make sure never to request any time we've requested before
  function loop() {
    const currentTime = playbackAudioContext.currentTime;
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
    const sourceNode = playSound(audioEvent.audioBuffer, audioEvent.realTime + offset);
    const audioEventReference:AudioEventReference = {audioEvent, sourceNode};
    scheduledAudioEvents.push(audioEventReference);
    // Event listener will fire on context.suspend() as well as audiobuffer finishing
    // The 'stop' button wants to clear audio that's in mid-play
    sourceNode.addEventListener('ended', () => stopAudioAndUnschedule(audioEventReference));
  }


  function stopAudioAndUnschedule(audioEventReference:AudioEventReference) {
    stopAudio(audioEventReference.sourceNode);
    const scheduleIndex = scheduledAudioEvents.indexOf(audioEventReference);
    if (scheduleIndex !== -1)
      scheduledAudioEvents.splice(scheduleIndex, 1);
  }


  function stopAudio(sourceNode:AudioBufferSourceNode) {
    sourceNode.stop();
    sourceNode.disconnect();
  }


  function scheduleCallbackEvent(callbackEvent:Banana.CallbackEvent) {
    const msFromNow = (callbackEvent.realTime - playbackAudioContext.currentTime + offset) * 1000;
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
    const msFromNow = (muteEvent.realTime - playbackAudioContext.currentTime + offset) * 1000;
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
    scheduledAudioEvents.forEach(({sourceNode}) => stopAudio(sourceNode));
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
