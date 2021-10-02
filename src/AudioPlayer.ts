const lookahead = 0.25; // (s) Look 250ms ahead for notes
const loopFrequency = 125 // (ms) - mixed units are confusing, but we can skip some pointless maths

export function AudioPlayer(noteSource: NoteSource) {
  const audioContext = new AudioContext();
  audioContext.suspend();
  const audioBufferCache = {};
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
    const cachedAudioBuffer = getFromCache(note);
    if (cachedAudioBuffer instanceof Promise)
      return await cachedAudioBuffer;
    if (cachedAudioBuffer)
      return cachedAudioBuffer;

    const audio = noteSource.library.getAudio(note.instrumentId, note.styleId);
    const audioBufferPromise = audioContext.decodeAudioData(audio);
    cache(note, audioBufferPromise);
    const newAudioBuffer = await audioBufferPromise;
    cache(note, newAudioBuffer);

    return newAudioBuffer;
  }

  function getFromCache(note: Note): AudioBuffer|Promise<AudioBuffer>|undefined {
    const {instrumentId, styleId} = note;
    return audioBufferCache[instrumentId]?.[styleId];
  }

  function cache(note:Note, thingToCache: AudioBuffer|Promise<AudioBuffer>): void {
    const {instrumentId, styleId} = note;
    if (!audioBufferCache[instrumentId])
      audioBufferCache[instrumentId] = {};
    audioBufferCache[instrumentId][styleId] = thingToCache;
  }
}
