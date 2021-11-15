const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

function AudioPlayerBuilder(audioEventSource: AudioEventSource): AudioPlayer {
  const audioContext = new AudioContext();
  audioContext.suspend();
  const audioHistory = AudioHistory();
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
    const audioEventsToSchedule = audioEventSource.getAudioEvents(interval);
    audioEventsToSchedule.forEach(audioEvent => {
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
}


export const AudioPlayer:AudioPlayerBuilder = AudioPlayerBuilder;





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
