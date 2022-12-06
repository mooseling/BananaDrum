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

  type ScheduledEvent = AudioBufferSourceNode|number;
  const scheduledEvents:ScheduledEvent[] = [];

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
      });
    });
  }


  function scheduleAudioEvent({audioBuffer, realTime}:Banana.AudioEvent) {
    const sourceNode = playSound(audioBuffer, realTime + offset);
    scheduledEvents.push(sourceNode);
    sourceNode.addEventListener('ended', () => removeFromSchedule(sourceNode));
  }


  function scheduleCallbackEvent({realTime, callback}:Banana.CallbackEvent) {
    const msFromNow = (realTime - playbackAudioContext.currentTime + offset) * 1000;
    const timeoutId = setTimeout(() => {
      callback();
      removeFromSchedule(timeoutId);
    }, msFromNow);
    scheduledEvents.push(timeoutId);
  }


  function removeFromSchedule(scheduledEvent:ScheduledEvent) {
    const scheduleIndex = scheduledEvents.indexOf(scheduledEvent);
    if (scheduleIndex !== -1)
      scheduledEvents.splice(scheduleIndex, 1);
    if (scheduledEvent instanceof AudioBufferSourceNode) {
      scheduledEvent.stop();
      scheduledEvent.disconnect();
    }
    // Currently no need to clearTimeout on callback events
    // They are only getting unscheduled by this function after they fire
    // They are also getting unscheduled by clearScheduledEvents, which does clearTimeout
  }


  function clearScheduledEvents(): void {
    scheduledEvents.forEach((scheduledEvent:ScheduledEvent) => {
      if (scheduledEvent instanceof AudioBufferSourceNode)
        scheduledEvent.stop();
      else
        clearTimeout(scheduledEvent);
    });
    scheduledEvents.splice(0);
  }
})();
