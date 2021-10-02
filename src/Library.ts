import * as AudioGetter from 'AudioGetter.js';

let libraryLoaded = false;
let loadPromiseResolver: Function|undefined;
const loadPromise: Promise<void> = new Promise(resolve => loadPromiseResolver = resolve);


export function load() {
  if (!libraryLoaded) {
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

  return loadPromise;
}


export function getAudio(instrumentId:string, styleId:string): ArrayBuffer {
  if (!libraryLoaded)
    throw 'Trying to get audio from Library before loading the library!';

  const noteStyle = instruments?.[instrumentId].noteStyles?.[styleId];
  if (!noteStyle)
    throw `Missing instrument (${instrumentId}) or style (${styleId})`;

  return noteStyle.audio;
}


const instruments: InstrumentLibrary = {
  kick: {
    displayName: 'Kick drum',
    noteStyles: {
      kick: {
        file: 'kick.mp3'
        // displayName, symbol
      }
    }
  },
  snare: {
    displayName: 'Snare',
    noteStyles: {
      accent:{
        file: 'snare.mp3'
      },
      roll:{
        file: 'roll.mp3'
      }
    }
  },
  hihat: {
    displayName: 'Hi Hat',
    noteStyles: {
      closed: {
        file: 'hihat.mp3'
      }
    }
  }
};
