import {AudioGetter} from './AudioGetter.js';

const audioCtx = new AudioContext(); // Just for creating AudioBuffers





export function Library(instrumentCollection:InstrumentCollection):Library {
  let loaded = false;
  const instruments: {[instrumentId:string]:Instrument} = {};
  let loadPromiseResolver: Function|undefined;
  const loadPromise: Promise<void> = new Promise(resolve => loadPromiseResolver = resolve);

  return {load, getInstrument};

  // ==================================================================
  //                          Public Functions
  // ==================================================================
  function load() {
    if (!loaded) {
      loadInstruments().then(() => {
        loaded = true;
        loadPromiseResolver();
      });
    }
    return loadPromise;
  }


  function getInstrument(instrumentId:string): Instrument {
    if (!loaded)
      throw 'Trying to get instruments before library is loaded';
    return instruments[instrumentId];
  }




  // ==================================================================
  //                          Private Functions
  // ==================================================================

  function loadInstruments(): Promise<any> {
    const instrumentPromises:Promise<any>[] = [];
    instrumentCollection.forEach(packedInstrument => {
      const {instrumentId} = packedInstrument;
      const instrumentPromise = Instrument(packedInstrument);
      instrumentPromises.push(instrumentPromise);
      instrumentPromise.then(instrument => instruments[instrumentId] = instrument);
    });
    return Promise.all(instrumentPromises);
  }
}


async function Instrument(packedInstrument:PackedInstrument): Promise<Instrument> {
  const {instrumentId, packedNoteStyles, displayName} = packedInstrument;
  const noteStyles = await unpackNoteStyles(packedNoteStyles);
  const instrument = {instrumentId, noteStyles, displayName, createUntimedNote};

  return instrument;


  function createUntimedNote(noteStyleId:string): UntimedNote {
    const noteStyle = noteStyles[noteStyleId]
    return {instrument, noteStyle, audioBuffer:noteStyle.audioBuffer};
  }
}


async function unpackNoteStyles(packedNoteStyles:PackedNoteStyle[]): Promise<NoteStyleSet> {
  const noteStyles:NoteStyleSet = {};
  const unpackPromises:Promise<any>[] = [];
  packedNoteStyles.forEach(({noteStyleId, file}) => {
    unpackPromises.push(AudioGetter.get(file).then(async arrayBuffer => {
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      noteStyles[noteStyleId] = {noteStyleId, file, audioBuffer};
    }));
  });
  await Promise.all(unpackPromises);
  return noteStyles;
}
