import { PackedInstrument, Instrument, NoteStyleBase, NoteStyle, Library, InstrumentMeta } from './types/general.js';
import { loadAudio } from './loadAudio.js';
import { createPublisher } from './Publisher.js';

const packedInstruments:{[id:string]: PackedInstrument} = {};
const instruments: {[id:string]:Instrument} = {};


const instrumentMetas:InstrumentMeta[] = [];


export function getLibrary(): Library  {
  return { instrumentMetas, load, getInstrument };
}


function load(instrumentCollection:PackedInstrument[]): void {
  instrumentCollection.forEach(packedInstrument => {
    packedInstruments[packedInstrument.id] = packedInstrument;
    instrumentMetas.push({
      id: packedInstrument.id,
      displayOrder: packedInstrument.displayOrder,
      displayName: packedInstrument.displayName,
      colourGroup: packedInstrument.colourGroup,
      noteStyles: createNoteStyleBases(packedInstrument)
    });
  });
}


function getInstrument(id:string): Instrument {
  if (!instruments[id]) {
    if (!packedInstruments[id])
      throw 'Unknown instrument requested from Library';
    instruments[id] = createInstrument(packedInstruments[id]);
  }
  return instruments[id];
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
  const unpackPromises:Promise<AudioBuffer>[] = [];

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


export function getNoteStyleCount(instrumentId:string): number {
  const instrument = getLibrary().getInstrument(instrumentId);
  return Object.keys(instrument.noteStyles).length + 1; // + 1 for rests
}