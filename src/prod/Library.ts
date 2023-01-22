import { PackedInstrument, Instrument, NoteStyleBase, NoteStyle, ILibrary } from './types';
import {loadAudio} from './loadAudio';
import {createPublisher} from './Publisher';

const packedInstruments:{[id:string]: PackedInstrument} = {};
const instruments: {[id:string]:Instrument} = {};

export const Library:ILibrary = {
  instrumentMetas: [],
  load(instrumentCollection:PackedInstrument[]): void {
    instrumentCollection.forEach(packedInstrument => {
      packedInstruments[packedInstrument.id] = packedInstrument;
      Library.instrumentMetas.push({
        id: packedInstrument.id,
        displayOrder: packedInstrument.displayOrder,
        displayName: packedInstrument.displayName,
        colourGroup: packedInstrument.colourGroup,
        noteStyles: createNoteStyleBases(packedInstrument)
      });
    });
  },
  getInstrument(id:string): Instrument {
    if (!instruments[id]) {
      if (!packedInstruments[id])
        throw 'Unknown instrument requested from Library';
      instruments[id] = createInstrument(packedInstruments[id]);
    }
    return instruments[id];
  }
}


function createNoteStyleBases(packedInstrument:PackedInstrument):
  {[id: string]: NoteStyleBase} {
  const noteStyleBases:{[id: string]: NoteStyleBase} = {};
  for (const id in packedInstrument.packedNoteStyles)
    noteStyleBases[id] = {id, symbol:packedInstrument.packedNoteStyles[id].symbol};
  return noteStyleBases;
}



// This should be the only instance of an instrument
// So if this is called, the instrument must start unloaded
function createInstrument(packedInstrument:PackedInstrument): Instrument {
  const {id, packedNoteStyles, displayOrder, displayName, colourGroup} = packedInstrument;
  const publisher = createPublisher();

  let loaded = false;
  const noteStyles:{[id:string]: NoteStyle|null} = {};
  const unpackPromises:Promise<any>[] = [];

  const instrument = {
    id, noteStyles, displayOrder, displayName, colourGroup,
    get loaded() {return loaded;},
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };

  packedNoteStyles.forEach(({id, file, symbol, muting}) => {
    noteStyles[id] = {id, symbol, audioBuffer:null, instrument, muting};
    unpackPromises.push(
      loadAudio(file)
        .then(audioBuffer => noteStyles[id].audioBuffer = audioBuffer)
    );
  });
  Promise.all(unpackPromises).then(() => {
    loaded = true;
    publisher.publish();
  });

  return instrument;
}
