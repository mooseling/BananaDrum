// The core of Banana Drum is the EventEngine
// It plays audio and fires callbacks at the right time
// Playing audio boils down to the WebAudio API, so we must warp our design around that


const lookahead = 0.25; // (s) Look 250ms ahead for events
const loopFrequency = 125 // (ms) Check for upcoming events every 125ms

export const EventEngine:Banana.EventEngine = (function(){
  let audioContext:AudioContext|null = null;
  const eventSources:Banana.EventSource[] = [];
  let nextIteration: number|null = null;
  let timeCovered:number = 0;

  type ScheduledEvent = AudioBufferSourceNode|number;
  const scheduledEvents:ScheduledEvent[] = [];

  return {initialise, connect, play, pause, getTime};






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  // Browsers require that an AudioContext is created as a result of user interaction
  function initialise() {
    if (audioContext === null) {
      audioContext = new AudioContext();
      audioContext.suspend();
    }
  }


  function connect(eventSource:Banana.EventSource) {
    eventSources.push(eventSource);
  }


  function play() {
    checkInitialised();
    if (nextIteration === null) {
      audioContext.resume();
      loop();
    }
  }


  function pause() {
    if (nextIteration !== null) {
      audioContext.suspend();
      clearScheduledEvents();
      clearTimeout(nextIteration);
      nextIteration = null;
      timeCovered = audioContext.currentTime;
    }
  }


  function getTime() {
    checkInitialised();
    return audioContext.currentTime;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function checkInitialised() {
    if (audioContext === null)
      throw 'The AudioPlayer has not been initialised';
  }


  // The loop is a setTimeout loop
  // It gets and schedules events in an upcoming time interval
  // We make sure never to request any time we've requested before
  function loop() {
    const currentTime = audioContext.currentTime;
    const interval:Banana.Interval = {start:timeCovered, end: currentTime + lookahead};
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
    const sourceNode = new AudioBufferSourceNode(audioContext, {buffer:audioBuffer});
    sourceNode.connect(audioContext.destination);
    sourceNode.start(realTime);
    scheduledEvents.push(sourceNode);
    sourceNode.addEventListener('ended', () => unSchedule(sourceNode));
  }


  function scheduleCallbackEvent({realTime, callback}:Banana.CallbackEvent) {
    const msFromNow = (realTime - audioContext.currentTime) * 1000;
    const timeoutId = setTimeout(() => {
      callback();
      unSchedule(timeoutId);
    }, msFromNow);
    scheduledEvents.push(timeoutId);
  }


  function unSchedule(scheduledEvent:ScheduledEvent) {
    const scheduleIndex = scheduledEvents.indexOf(scheduledEvent);
    if (scheduleIndex !== -1)
      scheduledEvents.splice(scheduleIndex, 1);
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
