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
    const notesToSchedule = noteSource.getPlayableNotes(currentTime, currentTime + lookahead);
    notesToSchedule.forEach(note => scheduleNote(note));
    nextIteration = setTimeout(loop, loopFrequency);
  }

  async function scheduleNote(playableNote: PlayableNote) {
    const sourceNode = await getSourceNode(playableNote.note);
    sourceNode.connect(audioContext.destination);
    sourceNode.start(playableNote.realTime);
  }

  async function getSourceNode(note: Note) {
    return new AudioBufferSourceNode(
      audioContext,
      {buffer: await getAudioBuffer(note)}
    );
  }

  async function getAudioBuffer(note: Note) {
    const audio = noteSource.library.getAudio(note.instrumentId, note.styleId);

    const newAudioBuffer = await audioContext.decodeAudioData(audio);
    return newAudioBuffer;
  }
}
