const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

export const AudioPlayer:AudioPlayer = (function(){
  let audioContext:AudioContext|null = null;
  const audioSources:AudioEventSource[] = [];
  const callbackSources:CallbackEventSource[] = [];
  let nextIteration: number|null = null;
  let intervalProgress:number = 0;

  return {initialise, connect, play, pause, getTime};






  // ==================================================================
  //                          Public Functions
  // ==================================================================


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


  function loop() {
    const currentTime = audioContext.currentTime;
    const interval:Interval = {start:intervalProgress, end: currentTime + lookahead};
    scheduleAudioEvents(interval);
    scheduleCallbackEvents(interval);
    nextIteration = setTimeout(loop, loopFrequency);
    intervalProgress = currentTime + lookahead;
  }


  function scheduleAudioEvents(interval:Interval) {
    const audioEvents:AudioEvent[] = [];
    audioSources.forEach(audioSource => audioEvents.push(...audioSource.getAudioEvents(interval)));
    audioEvents.forEach(audioEvent => scheduleAudioEvent(audioEvent));
  }


  function scheduleAudioEvent(audioEvent: AudioEvent) {
    const sourceNode = getSourceNode(audioEvent.audioBuffer);
    sourceNode.connect(audioContext.destination);
    sourceNode.start(audioEvent.realTime);
  }


  function scheduleCallbackEvents(interval:Interval) {
    callbackSources.forEach(callbackSource => callbackSource.getCallbackEvents(interval).forEach(callbackEvent => scheduleCallbackEvent(callbackEvent)));
  }


  function scheduleCallbackEvent(event:CallbackEvent) {
    const msFromNow = (event.realTime - audioContext.currentTime) * 1000;
    setTimeout(event.callback, msFromNow);
  }


  function getSourceNode(buffer:AudioBuffer): AudioBufferSourceNode {
    return new AudioBufferSourceNode(audioContext, {buffer: buffer});
  }
})();
