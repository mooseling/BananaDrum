// The core of Banana Drum is AudioPlayer
// It plays audio - and also cues up other events!
// Playing audio boils down to the WebAudio API, so we must warp our design around that


const lookahead = 0.25; // (s) Look 250ms ahead for events
const loopFrequency = 125 // (ms) Check for upcoming events every 125ms

export const AudioPlayer:AudioPlayer = (function(){
  let audioContext:AudioContext|null = null;
  const audioSources:AudioEventSource[] = [];
  const callbackSources:CallbackEventSource[] = [];
  let nextIteration: number|null = null;
  let timeCovered:number = 0;

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


  function connect(eventSource:AudioEventSource|CallbackEventSource) {
    checkInitialised();
    if ('getAudioEvents' in eventSource)
      audioSources.push(eventSource as AudioEventSource);
    if ('getCallbackEvents' in eventSource)
      callbackSources.push(eventSource as CallbackEventSource);
  }


  function play() {
    checkInitialised();
    if (nextIteration === null) {
      audioContext.resume();
      loop();
    }
  }


  function pause() {
    checkInitialised();
    if (nextIteration !== null) {
      audioContext.suspend();
      clearTimeout(nextIteration);
      nextIteration = null;
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
    const interval:Interval = {start:timeCovered, end: currentTime + lookahead};
    scheduleAudioEvents(interval);
    scheduleCallbackEvents(interval);
    nextIteration = setTimeout(loop, loopFrequency);
    timeCovered = currentTime + lookahead;
  }


  function scheduleAudioEvents(interval:Interval) {
    const audioEvents:AudioEvent[] = [];
    audioSources.forEach(audioSource => audioEvents.push(...audioSource.getAudioEvents(interval)));
    audioEvents.forEach(({audioBuffer, realTime}) => {
      const sourceNode = new AudioBufferSourceNode(audioContext, {buffer:audioBuffer});
      sourceNode.connect(audioContext.destination);
      sourceNode.start(realTime);
    });
  }


  function scheduleCallbackEvents(interval:Interval) {
    callbackSources.forEach(callbackSource => callbackSource.getCallbackEvents(interval).forEach(({realTime, callback}) => {
      const msFromNow = (realTime - audioContext.currentTime) * 1000;
      setTimeout(callback, msFromNow);
    }));
  }
})();
