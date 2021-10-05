import {AudioGetter} from './AudioGetter.js';

const instruments: InstrumentCollection = {};
let libraryLoaded = false;
let loadPromiseResolver: Function|undefined;
const loadPromise: Promise<void> = new Promise(resolve => loadPromiseResolver = resolve);





export function Library():Library {
  return {load, getAudio};

  // ==================================================================
  //                          Public Functions
  // ==================================================================
  function load(libraryToLoad:InstrumentCollection) {
    if (!libraryLoaded) {
      populateLibrary(libraryToLoad);
      loadAllAudio(); // This will eventually cause loadPromise to resolve
    }
    return loadPromise;
  }


  function getAudio(instrumentId:string, styleId:string): ArrayBuffer {
    if (!libraryLoaded)
      throw 'Trying to get audio from Library before loading the library!';

    const noteStyle = instruments?.[instrumentId].noteStyles?.[styleId];
    if (!noteStyle)
      throw `Missing instrument (${instrumentId}) or style (${styleId})`;

    return noteStyle.audio;
  }




  // ==================================================================
  //                          Private Functions
  // ==================================================================

  function populateLibrary(libraryToLoad:InstrumentCollection): void {
    for (const instrumentId in libraryToLoad) {
      const instrument = libraryToLoad[instrumentId];
      instruments[instrumentId] = {
        displayName: instrument.displayName,
        noteStyles: unpackNoteStyles(instrument)
      }
    }
  }


  function unpackNoteStyles(instrument:Instrument): NoteStyleSet {
    const noteStyles:NoteStyleSet = {};
    for (const styleId in instrument.noteStyles) {
      noteStyles[styleId] = {
        file: instrument.noteStyles[styleId].file
      };
    }
    return noteStyles;
  }


  function loadAllAudio(): void {
    const audioPromises: Promise<ArrayBuffer>[] = [];
    for (const instrumentId in instruments) {
      const instrument = instruments[instrumentId];
      for (const styleId in instrument.noteStyles) {
        const noteStyle = instrument.noteStyles[styleId];
        const audioPromise = AudioGetter.get(noteStyle.file);
        audioPromises.push(audioPromise);
        audioPromise.then(audio => noteStyle.audio = audio);
      }
    }
    Promise.all(audioPromises).then(() => {
      loadPromiseResolver();
      libraryLoaded = true;
    });
  }
}
