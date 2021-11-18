const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

export const AudioPlayer:AudioPlayer = (function(){
  let audioContext:AudioContext|null = null;
  const audioSources:AudioEventSource[] = [];
  let nextIteration: number|null = null;
  const audioHistory = AudioHistory();

  return {initialise, connect, play, pause, getTime};






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function initialise() {
    audioContext = new AudioContext();
    audioContext.suspend();
  }


  function connect(audioSource:AudioEventSource) {
    checkInitialised();
    audioSources.push(audioSource);
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
    const interval:Interval = {start:currentTime, end: currentTime + lookahead};
    const audioEvents:AudioEvent[] = [];
    audioSources.forEach(audioSource => audioEvents.push(...audioSource.getAudioEvents(interval)));
    audioEvents.forEach(audioEvent => {
      if (!audioHistory.contains(audioEvent))
        schedule(audioEvent);
    });
    nextIteration = setTimeout(loop, loopFrequency);
  }


  function schedule(audioEvent: AudioEvent) {
    const sourceNode = getSourceNode(audioEvent.audioBuffer);
    sourceNode.connect(audioContext.destination);
    sourceNode.start(audioEvent.realTime);
    audioHistory.record(audioEvent);
  }


  function getSourceNode(buffer:AudioBuffer): AudioBufferSourceNode {
    return new AudioBufferSourceNode(audioContext, {buffer: buffer});
  }
})();





// To prevent double-playing notes, we keep track of what we've already played
interface AudioHistory {
  record(audioEvent:AudioEvent): void
  contains(audioEvent:AudioEvent): boolean
}


function AudioHistory():AudioHistory {
  const seenIds:string[] = []; // We track using AudioEvent.id

  return {
    record({identifier}:AudioEvent) {
      seenIds.push(identifier);
    },
    contains({identifier}:AudioEvent) {
      return seenIds.includes(identifier);
    }
  };
}
