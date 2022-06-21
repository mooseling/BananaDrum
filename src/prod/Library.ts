import {AudioGetter} from './AudioGetter';
import {Publisher} from './Publisher';

const packedInstruments:{[id:string]: Banana.PackedInstrument} = {};
const instruments: {[id:string]:Banana.Instrument} = {};

export const Library:Banana.Library = {
  instrumentMetas: [],
  load(instrumentCollection:Banana.InstrumentCollection): void {
    instrumentCollection.forEach(packedInstrument => {
      packedInstruments[packedInstrument.id] = packedInstrument;
      Library.instrumentMetas.push({
        id: packedInstrument.id,
        displayName: packedInstrument.displayName,
        colourGroup: packedInstrument.colourGroup
      });
    });
  },
  getInstrument(id:string): Banana.Instrument {
    if (!instruments[id]) {
      if (!packedInstruments[id])
        throw 'Unknown instrument requested from Library';
      instruments[id] = Instrument(packedInstruments[id]);
    }
    return instruments[id];
  }
}



// This should be the only instance of an instrument
// So if this is called, the instrument must start unloaded
function Instrument(packedInstrument:Banana.PackedInstrument): Banana.Instrument {
  const {id, packedNoteStyles, displayName, colourGroup} = packedInstrument;
  const publisher = Publisher();

  let loaded = false;
  const noteStyles:{[id:string]: Banana.NoteStyle|null} = {};
  const unpackPromises:Promise<any>[] = [];
  packedNoteStyles.forEach(({id, file, symbol}) => {
    noteStyles[id] = {id, symbol, audioBuffer:null};
    unpackPromises.push(
      AudioGetter.get(file)
        .then(audioBuffer => noteStyles[id] = {id, audioBuffer, symbol})
    );
  });
  Promise.all(unpackPromises).then(() => {
    loaded = true;
    publisher.publish();
  });

  return {
    id, noteStyles, displayName, colourGroup,
    get loaded() {return loaded;},
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe
  };
}
