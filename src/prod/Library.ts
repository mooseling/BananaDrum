import {AudioGetter} from './AudioGetter';


export function Library(instrumentCollection:Banana.InstrumentCollection): Banana.Library {
  let loaded = false;
  const instruments: {[instrumentId:string]:Banana.Instrument} = {};
  let loadPromiseResolver: Function|undefined;
  const loadPromise: Promise<void> = new Promise(resolve => loadPromiseResolver = resolve);

  return {
    load,
    get instruments() {return getInstruments()}
  };






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


  function getInstruments() {
    if (!loaded)
      throw 'Trying to get instruments before library is loaded';
    return instruments;
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


async function Instrument(packedInstrument:Banana.PackedInstrument): Promise<Banana.Instrument> {
  const {instrumentId, packedNoteStyles, displayName} = packedInstrument;
  const noteStyles = await unpackNoteStyles(packedNoteStyles);
  return {instrumentId, noteStyles, displayName};
}


async function unpackNoteStyles(packedNoteStyles:Banana.PackedNoteStyle[]): Promise<{[id:string]: Banana.NoteStyle}> {
  const noteStyles:{[id:string]: Banana.NoteStyle|null} = {};
  const unpackPromises:Promise<any>[] = [];
  packedNoteStyles.forEach(({noteStyleId, file}) => {
    noteStyles[noteStyleId] = null; // Set this so that they appear in the original order
    unpackPromises.push(
      AudioGetter.get(file)
        .then(audioBuffer => noteStyles[noteStyleId] = {noteStyleId, audioBuffer})
    );
  });
  await Promise.all(unpackPromises);
  return noteStyles;
}
