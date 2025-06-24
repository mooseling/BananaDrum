import { getNoteStyleCount } from '../Library.js';
import { ArrangementSnapshot, SerialisedArrangement, TrackSnapshot } from '../types/snapshots.js';
import { polyrhythmCharacterToNumber, serialisationVersion, urlCharacterToNumber } from './constants.js';
import { interpretAsBaseN, urlEncodeNumber } from './numeric_functions.js';



export function serialiseArrangementSnapshot(arrangementSnapshot:ArrangementSnapshot): SerialisedArrangement {
  const tp = arrangementSnapshot.timeParams;
  let serialisedArrangement = `${tp.timeSignature}.${tp.tempo}.${tp.length}.${tp.pulse}.${tp.stepResolution}`;

  // We can't have "/" in the url, but it appears in timeSignature and stepResolution
  serialisedArrangement = serialisedArrangement.replaceAll('/', '-');

  // First character is instrument-ID, with no separator after
  // We assume that more than 64 instruments is a long way off, and we can introduce a new serialisation version then
  arrangementSnapshot.tracks.forEach(trackSnapshot => serialisedArrangement += '.' + serialiseTrackSnapshot(trackSnapshot));

  return {
    title: arrangementSnapshot.title,
    composition: serialisedArrangement,
    version: serialisationVersion
  };
}


function serialiseTrackSnapshot(trackSnapshot:TrackSnapshot): string {
  const serialisedNotes = serialiseNotes(trackSnapshot);
  let serialisedTrack = trackSnapshot.instrumentId + serialisedNotes;
  if (trackSnapshot.polyrhythms.length)
    serialisedTrack += '-' + serialisePolyrhythms(trackSnapshot);
  return serialisedTrack;
}


function serialiseNotes(trackSnapshot:TrackSnapshot): string {
  const notesStylesAsNumbers = trackSnapshot.notes.map(noteChar => urlCharacterToNumber[noteChar]);
  const base = getNoteStyleCount(trackSnapshot.instrumentId);
  const notesAsNumber = interpretAsBaseN(notesStylesAsNumbers, base);

  return urlEncodeNumber(notesAsNumber);
}


function serialisePolyrhythms(trackSnapshot:TrackSnapshot): string {
  const polyrhythmString = trackSnapshot.polyrhythms
    .map(({start, end, length}) => `${start}-${end - start}-${length}`)
    .join('-');

  return packPolyrhythmString(polyrhythmString);
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
