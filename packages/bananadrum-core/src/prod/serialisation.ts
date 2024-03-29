import bigInt from 'big-integer';
import { Arrangement, PackedArrangement, PackedNote, PackedTiming, PackedTrack, Timing, Track } from './types.js';
import { getLibrary } from './Library.js';
import { createTimeParams } from './TimeParams.js';



// ==================================================================
//                          Public Functions
// ==================================================================


export function getShareLink(arrangement:Arrangement) {
  const query = urlEncodeArrangement(arrangement);
  return 'https://bananadrum.net/?a=' + query;
}


export function urlDecodeArrangement(url:string): PackedArrangement {
  const chunks = url.replaceAll('-', '/').split('.');
  const timeParams = createTimeParams({
    timeSignature:chunks[0],
    tempo:Number(chunks[1]),
    length:Number(chunks[2]),
    pulse:chunks[3],
    stepResolution:Number(chunks[4])
  });
  return {
    timeParams,
    packedTracks: chunks.slice(5).map(url => createPackedTrack(url, timeParams.timings))
  };
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
    output = numberToCharacter[remainder.toJSNumber()] + output;
    input = quotient;
  } while (input.greater(bigInt.zero));

  return output;
}


// No negative numbers
function urlDecodeNumber(input:string): bigInt.BigInteger {
  let output = bigInt.zero;
  while (input.length) {
    output = output.times(conversionBase);
    output = output.plus(characterToNumber[input[0]]);
    input = input.substring(1);
  }

  return output;
}


// Input array of numbers are notes of a track, so I'd be surprised if they were ever greater than 10
// Therefore we can use the bigInt[number] feature
function interpretAsBaseN(inputDigits:number[], base:number): bigInt.BigInteger {
  let multiplier = bigInt.one;
  let total = bigInt.zero;

  for (let column = inputDigits.length - 1; column >= 0; column--) {
    const digit = bigInt[inputDigits[column]];
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


function urlEncodeTrack(track:Track): string {
  const base:number = Object.keys(track.instrument.noteStyles).length + 1; // + 1 for rests
  const noteStyles:number[] = track.notes.map(note => characterToNumber[note.noteStyle?.id || '0']);
  const musicAsNumber = interpretAsBaseN(noteStyles, base);
  const musicAsString = urlEncodeNumber(musicAsNumber);
  return track.instrument.id + musicAsString;
}


function createPackedTrack(urlEncodedTrack:string, timings:Timing[]): PackedTrack {
  const instrumentId = urlEncodedTrack[0];
  const instrumentMeta = getLibrary().instrumentMetas.filter(({id}) => id === instrumentId)[0];
  if (!instrumentMeta)
    throw 'Instrument not found';
  const musicAsString = urlEncodedTrack.substring(1);
  const musicAsNumber = urlDecodeNumber(musicAsString);
  const base = Object.keys(instrumentMeta.noteStyles).length + 1; // + 1 for rests
  const musicInBaseN = convertToBaseN(musicAsNumber, base);
  while (musicInBaseN.length < timings.length)
    musicInBaseN.unshift(0); // pad number with leading 0s

  const packedNotes:PackedNote[] = [];
  musicInBaseN.forEach((value, column) => {
    if (value) { // Rests will have value 0
      packedNotes.push({
        noteStyleId: numberToCharacter[value],
        timing: packTiming(timings[column])
      });
    }
  })

  return {instrumentId: instrumentMeta.id, packedNotes};
}


function packTiming({bar, step}:Timing): PackedTiming {
  return `${bar}:${step}`;
}


function urlEncodeArrangement(arrangement:Arrangement): string {
  const {timeParams:tp} = arrangement;
  let output = `${tp.timeSignature}.${tp.tempo}.${tp.length}.${tp.pulse}.${tp.stepResolution}`;
  output = output.replaceAll('/', '-');
  for (const trackId in arrangement.tracks) {
    const track = arrangement.tracks[trackId];
    if (track)
      output += '.' + urlEncodeTrack(track);
  }
  return output;
}


const conversionBase = bigInt[64]; // 64 characters to safely use in URLs

const numberToCharacter : {
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

const characterToNumber: {
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
