export interface AudioBufferPlayer {
  stop(): void
  onEnded: (callback:() => void) => void
}


export function createAudioBufferPlayer(audioBuffer:AudioBuffer, audioContext:AudioContext, time:number = 0)
    : AudioBufferPlayer {

  // Previously, we followed the recommend pattern: new AudioBufferSourceNode(audioContext, {buffer:audioBuffer});
  // But support for this constructor on iOS is only since 14.5
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;


  // When the user halts playback, if we simply stop all audio we will get popping
  // So instead we use gain, and fade the audio out rapidly
  // Maybe we should be doing this at the AudioContext level, rather than each sample...
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start(time);

  return {
    stop() {
      gainNode.gain.setTargetAtTime(0, 0, 0.05);
    },
    // Higher up, we use this listener to do some cleanup when audio finishes playing
    onEnded: callback => sourceNode.addEventListener('ended', callback)
  };
}
