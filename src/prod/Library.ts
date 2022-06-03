import {AudioGetter} from './AudioGetter';

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
  async getInstrument(id:string): Promise<Banana.Instrument> {
    if (!instruments[id]) {
      if (!packedInstruments[id])
        throw 'Unknown instrument requested from Library';
      instruments[id] = await Instrument(packedInstruments[id]);
    }
    return instruments[id];
  }
}



async function Instrument(packedInstrument:Banana.PackedInstrument): Promise<Banana.Instrument> {
  const {id, packedNoteStyles, displayName, colourGroup} = packedInstrument;
  const noteStyles = await unpackNoteStyles(packedNoteStyles);
  return {id, noteStyles, displayName, colourGroup};
}


async function unpackNoteStyles(packedNoteStyles:Banana.PackedNoteStyle[]): Promise<{[id:string]: Banana.NoteStyle}> {
  const noteStyles:{[id:string]: Banana.NoteStyle|null} = {};
  const unpackPromises:Promise<any>[] = [];
  packedNoteStyles.forEach(({id, file, symbol}) => {
    noteStyles[id] = null; // Set this so that they appear in the original order
    unpackPromises.push(
      AudioGetter.get(file)
        .then(audioBuffer => noteStyles[id] = {id, audioBuffer, symbol})
    );
  });
  await Promise.all(unpackPromises);
  return noteStyles;
}
