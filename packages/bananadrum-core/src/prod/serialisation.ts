import bigInt from 'big-integer';
import { Arrangement, ArrangementView, Note, PolyrhythmView, Track, TrackView } from './types/types.js';
import { getLibrary } from './Library.js';
import { createTimeParams } from './TimeParams.js';
import { createArrangement } from './Arrangement.js';


const baseUrl = 'https://bananadrum.net/';


export interface ArrangementState {
  title: string
  timeParams: TimeParamsState
  tracks: TrackState[]
}

interface TrackState {
  id: number
  serialisedTrack: string
}

interface TimeParamsState {
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


export function getArrangementState(arrangement:ArrangementView): ArrangementState {
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

// ==================================================================
//                            URL Characters
// ==================================================================

// RFC3986 does not explicitly list valid characters, but it does highlight some as reserved/unreserved
// Reserved: general delimiters: :/?#[]@, sub delimeters: !$&'()*+,;=
// Unreserved:  A-Za-z0-9-._~
// Elsewhere, the internet tell us there are some "unwise" characters: {}|\^[]`. We aspire to be wise, but may grow dumb later.
// So we stick with the RFC. We use A-Za-Z0-9_~ for encoding beats, and reserve .- for our own syntax.

const conversionBase = bigInt[64]; // 64 characters to safely use in URLs

const urlNumberToCharacter : {
  [number:number]: string
} = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: 'a',
  11: 'b',
  12: 'c',
  13: 'd',
  14: 'e',
  15: 'f',
  16: 'g',
  17: 'h',
  18: 'i',
  19: 'j',
  20: 'k',
  21: 'l',
  22: 'm',
  23: 'n',
  24: 'o',
  25: 'p',
  26: 'q',
  27: 'r',
  28: 's',
  29: 't',
  30: 'u',
  31: 'v',
  32: 'w',
  33: 'x',
  34: 'y',
  35: 'z',
  36: 'A',
  37: 'B',
  38: 'C',
  39: 'D',
  40: 'E',
  41: 'F',
  42: 'G',
  43: 'H',
  44: 'I',
  45: 'J',
  46: 'K',
  47: 'L',
  48: 'M',
  49: 'N',
  50: 'O',
  51: 'P',
  52: 'Q',
  53: 'R',
  54: 'S',
  55: 'T',
  56: 'U',
  57: 'V',
  58: 'W',
  59: 'X',
  60: 'Y',
  61: 'Z',
  62: '~',
  63: '_'
}

const urlCharacterToNumber: {
  [char:string]: number
} = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'a': 10,
  'b': 11,
  'c': 12,
  'd': 13,
  'e': 14,
  'f': 15,
  'g': 16,
  'h': 17,
  'i': 18,
  'j': 19,
  'k': 20,
  'l': 21,
  'm': 22,
  'n': 23,
  'o': 24,
  'p': 25,
  'q': 26,
  'r': 27,
  's': 28,
  't': 29,
  'u': 30,
  'v': 31,
  'w': 32,
  'x': 33,
  'y': 34,
  'z': 35,
  'A': 36,
  'B': 37,
  'C': 38,
  'D': 39,
  'E': 40,
  'F': 41,
  'G': 42,
  'H': 43,
  'I': 44,
  'J': 45,
  'K': 46,
  'L': 47,
  'M': 48,
  'N': 49,
  'O': 50,
  'P': 51,
  'Q': 52,
  'R': 53,
  'S': 54,
  'T': 55,
  'U': 56,
  'V': 57,
  'W': 58,
  'X': 59,
  'Y': 60,
  'Z': 61,
  '~': 62,
  '_': 63
}

const polyrhythmNumberToCharacter: {
  [number:number]: string
} = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '-'
};

const polyrhythmCharacterToNumber: {
  [char:string]: number
} = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '-': 10
};
