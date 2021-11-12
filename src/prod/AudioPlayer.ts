const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

function AudioPlayerBuilder(audioEventSource: AudioEventSource): AudioPlayer {
  const audioContext = new AudioContext();
  audioContext.suspend();
  let nextIteration: number|null = null;

  return {play, pause, getTime};




  // ==================================================================
  //                          Public Functions
  // ==================================================================

  function play() {
    if (nextIteration === null) {
      audioContext.resume();
      loop();
    }
  }

  function pause() {
    if (nextIteration !== null) {
      audioContext.suspend();
      clearTimeout(nextIteration);
      nextIteration = null;
    }
  }

  function getTime() {
    return audioContext.currentTime;
  }




  // ==================================================================
  //                          Private Functions
  // ==================================================================

  function loop() {
    const currentTime = audioContext.currentTime;
    const interval:Interval = {start:currentTime, end: currentTime + lookahead};
    const audioEventsToSchedule = audioEventSource.get(interval);
    audioEventsToSchedule.forEach(audioEvent => schedule(audioEvent));
    nextIteration = setTimeout(loop, loopFrequency);
  }

  function schedule(audioEvent: AudioEvent) {
    const sourceNode = getSourceNode(audioEvent.audioBuffer);
    sourceNode.connect(audioContext.destination);
    sourceNode.start(audioEvent.realTime);
  }

  function getSourceNode(buffer:AudioBuffer): AudioBufferSourceNode {
    return new AudioBufferSourceNode(audioContext, {buffer: buffer});
  }
}

export const AudioPlayer:AudioPlayerBuilder = AudioPlayerBuilder;
