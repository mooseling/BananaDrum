import bigInt from 'big-integer';
import { Arrangement, ArrangementView, Note, PolyrhythmView, Track, TrackView } from '../types/types.js';
import { getLibrary } from '../Library.js';
import { createTimeParams } from '../TimeParams.js';
import { createArrangement } from '../Arrangement.js';
import { baseUrl, conversionBase, polyrhythmCharacterToNumber, polyrhythmNumberToCharacter, urlCharacterToNumber, urlNumberToCharacter } from './constants.js';



export interface ArrangementSnapshot {
  title: string
  timeParams: TimeParamsSnapshot
  tracks: TrackSnapshot[]
}

interface TrackSnapshot {
  id: number
  serialisedTrack: string
}

interface TimeParamsSnapshot {
  timeSignature: string,
  tempo: number,
  length: number,
  pulse: string,
  stepResolution: number
}



// ==================================================================
//                          Public Functions
// ==================================================================


export function getShareLink(arrangement:ArrangementView): string {
  const serialisedArrangement = serialiseArrangement(arrangement);

  if (arrangement.title)
    return `${baseUrl}?t=${encodeURIComponent(arrangement.title)}&a2=${serialisedArrangement}`;

  return `${baseUrl}?a2=${serialisedArrangement}`;
}


export function serialiseArrangement(arrangement:ArrangementView): string {
  const arrangementState = getArrangementState(arrangement);

  const tp = arrangementState.timeParams;
  let output = `${tp.timeSignature}.${tp.tempo}.${tp.length}.${tp.pulse}.${tp.stepResolution}`;
  output = output.replaceAll('/', '-');
  arrangementState.tracks.forEach(trackState => output += '.' + trackState.serialisedTrack);

  return output;
}


export function getArrangementState(arrangement:ArrangementView): ArrangementSnapshot {
  const {timeSignature, tempo, length, pulse, stepResolution} = arrangement.timeParams;
  return {
    title: arrangement.title,
    timeParams: {timeSignature, tempo, length, pulse, stepResolution},
    tracks: arrangement.tracks.map(track => ({
      id:track.id,
      serialisedTrack:serialiseTrack(track)
    }))
  };
}


export function deserialiseArrangement(serialisedArrangement:string, version:number, title?:string): ArrangementView {
  const chunks = serialisedArrangement.split('.');

  const timeParams = createTimeParams(
    chunks[0].replace('-', '/'), // time signature
    Number(chunks[1]),           // tempo
    Number(chunks[2]),           // length
    chunks[3].replace('-', '/'), // pulse
    Number(chunks[4])            // step resolution
  );
  const arrangement = createArrangement(timeParams);

  if (title)
    arrangement.title = title; // Don't need decodeURIComponent, SearchParams already does this

  chunks.slice(5).forEach(serialisedTrack => deserlialiseTrack(serialisedTrack, arrangement, version));

  return arrangement;
}


// ==================================================================
//                        Exported for testing
// ==================================================================

export const testableFunctions = {
  urlEncodeNumber, urlDecodeNumber, interpretAsBaseN, convertToBaseN
};


// No negative numbers
function urlEncodeNumber(input:bigInt.BigInteger): string {
  let output = '';

  do {
    const {quotient, remainder} = input.divmod(conversionBase);
    output = urlNumberToCharacter[remainder.toJSNumber()] + output;
    input = quotient;
  } while (input.greater(bigInt.zero));

  return output;
}


// No negative numbers
function urlDecodeNumber(input:string): bigInt.BigInteger {
  let output = bigInt.zero;
  while (input.length) {
    output = output.times(conversionBase);
    output = output.plus(urlCharacterToNumber[input[0]]);
    input = input.substring(1);
  }

  return output;
}


function interpretAsBaseN(inputDigits:number[], base:number): bigInt.BigInteger {
  let multiplier = bigInt.one;
  let total = bigInt.zero;

  for (let column = inputDigits.length - 1; column >= 0; column--) {
    const digit = bigInt(inputDigits[column]);
    total = total.plus(digit.times(multiplier));
    multiplier = multiplier.times(base);
  }

  return total;
}


// Used for converting from a URL to a Track, so the output represents an array of notes
function convertToBaseN(input:bigInt.BigInteger, base:number): number[] {
  const output:number[] = [];

  do {
    const {quotient, remainder} = input.divmod(base);
    output.unshift(remainder.toJSNumber());
    input = quotient;
  } while (input.greater(bigInt.zero));

  return output;
}


function serialiseTrack(track:TrackView): string {
  const serialisedNotes = serialiseNotes(track);
  let serialisedTrack = track.instrument.id + serialisedNotes;
  if (track.polyrhythms.length)
    serialisedTrack += '-' + serialisePolyrhythms(track);
  return serialisedTrack;
}


function serialiseNotes(track:TrackView): string {
  const noteStyles:number[] = [];
  const noteIterator = track.getNoteIterator();
  for (const note of noteIterator) {
    noteStyles.push(urlCharacterToNumber[note.noteStyle?.id || '0'])
  }

  const base:number = Object.keys(track.instrument.noteStyles).length + 1; // + 1 for rests
  const notesAsNumber = interpretAsBaseN(noteStyles, base);

  return urlEncodeNumber(notesAsNumber);
}


function serialisePolyrhythms(track:TrackView): string {
  const serialisedPolyrhythms = [];

  // We do polyrhythms in reverse order in order to support nested polyrhthms
  // When we rebuild the polyrhythms one-by-one, the note-iterator is going to change after each one
  // So when we serialise, we have to mimic that behaviour in reverse

  const polyrhythmsToIgnore:PolyrhythmView[] = [];
  for (let polyrhythmIndex = track.polyrhythms.length - 1; polyrhythmIndex >= 0; polyrhythmIndex--) {
    const polyrhythm = track.polyrhythms[polyrhythmIndex];
    polyrhythmsToIgnore.push(polyrhythm);
    let start:number;
    let startEndDifference:number;

    const noteIterator = track.getNoteIterator(polyrhythmsToIgnore);
    let noteIndex = 0;
    for (const note of noteIterator) {
      if (note === polyrhythm.start)
        start = noteIndex;
      if (note === polyrhythm.end) {
        startEndDifference = noteIndex - start;
        break;
      }
      noteIndex++;
    }

    serialisedPolyrhythms.unshift(`${start}-${startEndDifference}-${polyrhythm.notes.length}`);
  }

  const unpackedPolyrhythms = serialisedPolyrhythms.join('-');
  return packPolyrhythmString(unpackedPolyrhythms);
}


function packPolyrhythmString(polyrhythmString:string): string {
  const digits:number[] = [];

  for (let index = 0; index < polyrhythmString.length; index++) {
    const char = polyrhythmString.charAt(index);
    digits.push(polyrhythmCharacterToNumber[char]);
  }

  const stringAsNumber = interpretAsBaseN(digits, 11);
  return urlEncodeNumber(stringAsNumber);
}


function deserlialiseTrack(serialisedTrack:string, arrangement:Arrangement, version:number) {
  const instrumentId = serialisedTrack[0];

  const instrument = getLibrary().getInstrument(instrumentId);
  if (!instrument)
    throw new Error('Instrument not found');

  const track = arrangement.addTrack(instrument);

  applySerialisedRhythmToTrack(serialisedTrack, track, version);
}


export function applySerialisedRhythmToTrack(serialisedTrack:string, track:Track, version:number): void {
  let splitterIndex = serialisedTrack.indexOf('-');
  if (splitterIndex === -1)
    splitterIndex = serialisedTrack.length;

  const serialisedNotes = serialisedTrack.substring(1, splitterIndex);
  const serialisedPolyrhythms = serialisedTrack.substring(splitterIndex + 1);

  deserialisePolyrhythms(track, serialisedPolyrhythms, version);
  deserialiseNotes(track, serialisedNotes);
}


function deserialiseNotes(track:Track, serialisedNotes:string) {
  const notesAsNumber = urlDecodeNumber(serialisedNotes);
  const base = Object.keys(track.instrument.noteStyles).length + 1; // + 1 for rests
  const musicInBaseN = convertToBaseN(notesAsNumber, base);

  const noteIterator = track.getNoteIterator();
  let fullNoteCount = 0;
  while (!noteIterator.next().done) {
    fullNoteCount++;
  }
  const leadingZeroesRequired = fullNoteCount - musicInBaseN.length;
  musicInBaseN.unshift(...Array.from(new Array(leadingZeroesRequired)).map(() => 0));

  let index = 0;
  for (const note of track.getNoteIterator()) {
    const noteStyleNumber = musicInBaseN[index];

    if (noteStyleNumber) // Rests will have value 0
      note.noteStyle = track.instrument.noteStyles[urlNumberToCharacter[noteStyleNumber]];
    else
      note.noteStyle = null;

    index++;
  }
}


function deserialisePolyrhythms(track:Track, serialisedPolyrhythms:string, version:number) {
  // We may be applying this to an existing Track as part of undo/redo, so we have to remove existing polyrhythms
  while (track.polyrhythms.length) {
    // Iterate backwards to remove polyrhythms safely. Might not matter.
    track.removePolyrhythm(track.polyrhythms[track.polyrhythms.length - 1]);
  }

  if (serialisedPolyrhythms === '')
    return;

  if (version >= 2)
    serialisedPolyrhythms = unpackPolyrhythmString(serialisedPolyrhythms);

  const interpretChunk = version >= 2
    ? (chunk:string) => Number(chunk)
    : (chunk:string) => urlDecodeNumber(chunk).toJSNumber();

  const chunks = serialisedPolyrhythms.split('-');

  // Each polyrhythm is encoded in 3 chunks
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 3) {
    const startIndex = interpretChunk(chunks[chunkIndex]);
    const startEndDifference = interpretChunk(chunks[chunkIndex + 1]);
    const polyrhythmLength = interpretChunk(chunks[chunkIndex + 2]);

    const endIndex = startIndex + startEndDifference;

    let startNote:Note;
    let endNote:Note;

    let index = 0;
    for (const note of track.getNoteIterator()) {
      if (index === startIndex)
        startNote = note;
      if (index === endIndex) {
        endNote = note;
        break;
      }

      index++;
    }

    track.addPolyrhythm(startNote, endNote, polyrhythmLength);
  }
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
