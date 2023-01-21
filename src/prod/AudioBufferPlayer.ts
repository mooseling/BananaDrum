import { AudioBufferPlayer } from "./types";

export function createAudioBufferPlayer(audioBuffer:AudioBuffer, audioContext:AudioContext, time:number = 0)
    : AudioBufferPlayer {
  const sourceNode = new AudioBufferSourceNode(audioContext, {buffer:audioBuffer});
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  sourceNode.connect(gainNode);
  sourceNode.start(time);

  return {
    stop() {
      gainNode.gain.setTargetAtTime(0, 0, 0.05);
    },
    onEnded: callback => sourceNode.addEventListener('ended', callback)
  };
}
