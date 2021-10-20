const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

export function AudioPlayer(noteEventSource: NoteEventSource): AudioPlayer {
  const audioContext = new AudioContext();
  audioContext.suspend();
  let nextIteration: number|null = null;

  return {play, pause};




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




  // ==================================================================
  //                          Private Functions
  // ==================================================================

  function loop() {
    const currentTime = audioContext.currentTime;
    const interval:Interval = {start:currentTime, end: currentTime + lookahead};
    const notesToSchedule = noteEventSource.getNoteEvents(interval);
    notesToSchedule.forEach(note => scheduleNote(note));
    nextIteration = setTimeout(loop, loopFrequency);
  }

  async function scheduleNote(noteEvent: NoteEvent) {
    const sourceNode = await getSourceNode(noteEvent.note);
    sourceNode.connect(audioContext.destination);
    sourceNode.start(noteEvent.realTime);
  }

  async function getSourceNode(note: Note) {
    return new AudioBufferSourceNode(
      audioContext,
      {buffer: note.audioBuffer}
    );
  }
}
