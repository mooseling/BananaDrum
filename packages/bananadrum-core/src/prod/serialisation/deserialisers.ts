import { getLibrary } from '../Library';
import { ArrangementSnapshot, PolyrhythmSnapshot, TrackSnapshot } from '../types/snapshots';
import { calculateStepsPerBar, getNewId } from '../utils';
import { polyrhythmNumberToCharacter, urlNumberToCharacter } from './constants';
import { convertToBaseN, urlDecodeNumber } from './numeric_functions';
import { SerialisedArrangement } from './serialisers';

export function deserialiseArrangement(serialisedArrangement:SerialisedArrangement): ArrangementSnapshot {
  const {title, composition} = serialisedArrangement;
  const chunks = composition.split('.');
  
  const timeParams = {
    timeSignature: chunks[0].replace('-', '/'),
    tempo: Number(chunks[1]),
    length: Number(chunks[2]),
    pulse: chunks[3].replace('-', '/'),
    stepResolution: Number(chunks[4])
  };

  const baseNoteCount = calculateStepsPerBar(timeParams.timeSignature, timeParams.stepResolution) * timeParams.length;
  const tracks = chunks.slice(5)
    .map(serialisedTrack => deserlialiseTrack(serialisedTrack, baseNoteCount, serialisedArrangement.version));

  return {title, timeParams, tracks};
}


function deserlialiseTrack(serialisedTrack:string, baseNoteCount:number, version:number): TrackSnapshot {
  const instrumentId = serialisedTrack[0];

  let splitterIndex = serialisedTrack.indexOf('-');
  if (splitterIndex === -1)
    splitterIndex = serialisedTrack.length;

  const serialisedNotes = serialisedTrack.substring(1, splitterIndex);
  const serialisedPolyrhythms = serialisedTrack.substring(splitterIndex + 1);
  const polyrhythms = deserialisePolyrhythms(serialisedPolyrhythms, version);
  const trackNoteCount = getNoteCountWithPolyrhythms(baseNoteCount, polyrhythms);
  const notes = deserialiseNotes(serialisedNotes, instrumentId, trackNoteCount);

  return {id:getNewId(), instrumentId, notes, polyrhythms};
}


// In general, each polyrhythm is serialised as start-startEndDifference-length, eg 0-7-6
// In version 1, we shortened the numbers by expressing them in url-characters, so base 64
// The full string looked like like 2-5-f-7-9b-3-4-9-1...
// In version 2, we instead used normal numbers, and compacted the entire string the way we compact the serialised notes
function deserialisePolyrhythms(serialisedPolyrhythms:string, version:number): PolyrhythmSnapshot[] {
  if (serialisedPolyrhythms === '')
    return [];

  if (version >= 2) // On version 2, we compacted the string. See comment on unpackPolyrhythmString
    serialisedPolyrhythms = unpackPolyrhythmString(serialisedPolyrhythms);

  const interpretChunk = version >= 2
    ? (chunk:string) => Number(chunk)
    : (chunk:string) => urlDecodeNumber(chunk).toJSNumber();

  const chunks = serialisedPolyrhythms.split('-');
  const polyrhythmSnapshots:PolyrhythmSnapshot[] = [];

  // Each polyrhythm is encoded in 3 chunks
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 3) {
    const start = interpretChunk(chunks[chunkIndex]);
    const startEndDifference = interpretChunk(chunks[chunkIndex + 1]);
    const end = start + startEndDifference
    const length = interpretChunk(chunks[chunkIndex + 2]);

    polyrhythmSnapshots.push({id:getNewId(), start, end, length});
  }

  return polyrhythmSnapshots;
}



function unpackPolyrhythmString(packedPolyrhythmsString:string): string {
  const polyrhythmsAsBigInt = urlDecodeNumber(packedPolyrhythmsString);
  const polyrhythmStringAsNumbers = convertToBaseN(polyrhythmsAsBigInt, 11);

  const unpackedPolyrhythmsString = polyrhythmStringAsNumbers.reduce(
    (a, b) => a + polyrhythmNumberToCharacter[b],
    ''
  );

  if (unpackedPolyrhythmsString.startsWith('-'))
    return '0' + unpackedPolyrhythmsString;
  return unpackedPolyrhythmsString;
}


// Working out the note-count of a track with arbitrary polyrhythms is actually easy, even with nesting
// Each polyrhythm simply hides some notes and adds some notes
// If you do them in order, we are just adding a modifier for each one
// And since addition is abelian, that means we actually don't care about the order here
// That said, I just used a mathematical term along with some hand-waving, so I could be wrong
function getNoteCountWithPolyrhythms(baseNoteCount:number, polyrhythmSnapshots:PolyrhythmSnapshot[]): number {
  return polyrhythmSnapshots
    .map(({start, end, length}) => length + start - end - 1)
    .reduce(
      (noteCount, polyrhythmLengthModifier) => noteCount + polyrhythmLengthModifier,
      baseNoteCount
    );
}


function deserialiseNotes(serialisedNotes:string, instrumentId:string, trackNoteCount:number): string[] {
  const notesAsNumber = urlDecodeNumber(serialisedNotes);
  const instrument = getLibrary().getInstrument(instrumentId);
  const base = Object.keys(instrument.noteStyles).length + 1; // + 1 for rests
  const musicInBaseN = convertToBaseN(notesAsNumber, base);

  // Since the notes are "concatted" into a number, any rests at the start become leading zeroes, and disappear
  const leadingZeroesRequired = trackNoteCount - musicInBaseN.length;
  musicInBaseN.unshift(...Array.from(new Array(leadingZeroesRequired)).map(() => 0));

  return musicInBaseN.map(noteStyleNumber => urlNumberToCharacter[noteStyleNumber]);
}