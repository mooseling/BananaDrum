const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

export function AudioPlayer(noteSource: NoteSource) {
  const audioContext = new AudioContext();
  audioContext.suspend();
  let nextIteration: number|null = null;

  return {play, pause};



  function play() {
    audioContext.resume();
    loop();
  }

  function pause() {
    audioContext.suspend();
    clearTimeout(nextIteration);
  }

  function loop() {
    const currentTime = audioContext.getOutputTimestamp().contextTime;
    const notesToSchedule = noteSource.getNotes(currentTime, currentTime + lookahead);
    notesToSchedule.forEach(note => {
      const sourceNode = new AudioBufferSourceNode(audioContext, {buffer: note.audioBuffer});
      sourceNode.start(note.time);
    });
    nextIteration = setTimeout(loop, loopFrequency);
  }
}
