const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

export function AudioPlayer(playableNoteSource: PlayableNoteSource) {
  const audioContext = new AudioContext();
  audioContext.suspend();
  const audioBufferLibrary = {};
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
    const notesToSchedule = playableNoteSource.getPlayableNotes(currentTime, currentTime + lookahead);
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
    const existingAudioBuffer = audioBufferLibrary[note.file];
    if (existingAudioBuffer)
      return existingAudioBuffer;

    const response = await fetch(note.file);
    const arrayBuffer = await response.arrayBuffer();
    const newAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    audioBufferLibrary[note.file] = newAudioBuffer;
    return newAudioBuffer;
  }
}
