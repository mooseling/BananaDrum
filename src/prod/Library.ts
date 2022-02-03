import {AudioGetter} from './AudioGetter';

const packedInstruments:{[instrumentId:string]: Banana.PackedInstrument} = {};
const instruments: {[instrumentId:string]:Banana.Instrument} = {};

export const Library:Banana.Library = {
  instrumentMetas: [],
  load(instrumentCollection:Banana.InstrumentCollection): void {
    instrumentCollection.forEach(packedInstrument => {
      packedInstruments[packedInstrument.instrumentId] = packedInstrument;
      Library.instrumentMetas.push({
        instrumentId: packedInstrument.instrumentId,
        displayName: packedInstrument.displayName,
        colourGroup: packedInstrument.colourGroup
      });
    });
  },
  async getInstrument(instrumentId:string): Promise<Banana.Instrument> {
    if (!instruments[instrumentId]) {
      if (!packedInstruments[instrumentId])
        throw 'Unknown instrument requested from Library';
      instruments[instrumentId] = await Instrument(packedInstruments[instrumentId]);
    }
    return instruments[instrumentId];
  }
}



async function Instrument(packedInstrument:Banana.PackedInstrument): Promise<Banana.Instrument> {
  const {instrumentId, packedNoteStyles, displayName, colourGroup} = packedInstrument;
  const noteStyles = await unpackNoteStyles(packedNoteStyles);
  return {instrumentId, noteStyles, displayName, colourGroup};
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
