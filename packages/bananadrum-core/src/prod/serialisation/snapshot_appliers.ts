import { createArrangement } from '../Arrangement.js';
import { getLibrary } from '../Library.js';
import { createTimeParams } from '../TimeParams.js';
import { ArrangementSnapshot, PolyrhythmSnapshot, TimeParamsSnapshot, TrackSnapshot } from '../types/snapshots.js';
import { Arrangement, Note, TimeParams, Track } from '../types/general.js';



export function createArrangementFromSnapshot(arrangementSnapshot:ArrangementSnapshot): Arrangement {
  const timeParams = createTimeParamsFromSnapshot(arrangementSnapshot.timeParams);
  const arrangement = createArrangement(timeParams);

  applyArrangementSnapshot(arrangement, arrangementSnapshot);

  return arrangement;
}


function createTimeParamsFromSnapshot(tps:TimeParamsSnapshot): TimeParams {
  return createTimeParams(tps.timeSignature, tps.tempo, tps.length, tps.pulse, tps.stepResolution);
}


// Used when loading Banana Drum, or when using Undo/Redo
export function applyArrangementSnapshot(arrangement:Arrangement, arrangementSnapshot:ArrangementSnapshot): void {

  // applyTimeParams is redundant when loading Banana Drum, since we just created the Arrangement with the same TPs
  // However, applying the full snapshot is required for Undo/Redo
  applyTimeParams(arrangement, arrangementSnapshot);
  arrangement.title = arrangementSnapshot.title;

  // Remove tracks that aren't in the snapshot
  arrangement.tracks.forEach(track => {
    if (!arrangementSnapshot.tracks.some(trackSnapshot => trackSnapshot.id === track.id))
      arrangement.removeTrack(track);
  })

  // Add missing tracks
  const library = getLibrary();
  arrangementSnapshot.tracks.forEach(trackSnapshot => {
    let track = arrangement.tracks.find(track => track.id === trackSnapshot.id);

    if (!track)
      track = arrangement.addTrack(library.getInstrument(trackSnapshot.instrumentId), trackSnapshot.id);

    applyTrackSnapshot(track, trackSnapshot);
  });
}


// Apply all timeParams without checking if they've changed. TP does this check and won't publish redundantly
function applyTimeParams(arrangement:Arrangement, arrangementSnapshot:ArrangementSnapshot): void {
  arrangement.timeParams.timeSignature = arrangementSnapshot.timeParams.timeSignature;
  arrangement.timeParams.tempo = arrangementSnapshot.timeParams.tempo;
  arrangement.timeParams.length = arrangementSnapshot.timeParams.length;
  arrangement.timeParams.pulse = arrangementSnapshot.timeParams.pulse;
  arrangement.timeParams.stepResolution = arrangementSnapshot.timeParams.stepResolution;
}


function applyTrackSnapshot(track:Track, trackSnapshot:TrackSnapshot): void {

  // First we remove polyrhythms, since this won't affect indexing
  let polyrhythmIndex = 0;
  while (polyrhythmIndex < track.polyrhythms.length) {
    const polyrhythm = track.polyrhythms[polyrhythmIndex];

    if (!trackSnapshot.polyrhythms.some(polyrhthmSnapshot => polyrhthmSnapshot.id === polyrhythm.id))
      track.removePolyrhythm(polyrhythm);
    else
      polyrhythmIndex++;
  }

  // Then we add missing polyrhythms, being careful to specify ID and index
  trackSnapshot.polyrhythms.forEach((polyrhythmSnapshot, polyrhythmIndex) => {
    const polyrhythmAtIndex = track.polyrhythms[polyrhythmIndex];
    if (!polyrhythmAtIndex || polyrhythmSnapshot.id !== polyrhythmAtIndex.id) {
      const [start, end] = getStartAndEndNotes(track, polyrhythmSnapshot, polyrhythmIndex);
      track.addPolyrhythm(start, end, polyrhythmSnapshot.length, polyrhythmSnapshot.id, polyrhythmIndex);
    }
  });

  let noteIndex = 0;
  for (const note of track.getNoteIterator()) {
    const noteStyleId = trackSnapshot.notes[noteIndex];
    const noteStyle = noteStyleId === '0'
      ? null
      : track.instrument.noteStyles[noteStyleId];
    note.noteStyle = noteStyle;
    noteIndex++;
  }
}


// Return the start and end Note objects for a polyrhythm we want to add to a Track
function getStartAndEndNotes(track:Track, polyrhthmSnapshot:PolyrhythmSnapshot, polyrhythmIndex:number): [Note, Note] {

  // We have to ignore later polyrhythms so that our start and end indexes are applied correctly
  const polyrhythmsToIgnore = track.polyrhythms.slice(polyrhythmIndex);
  const startEndNotes:Note[] = [];
  let index = 0;

  for (const note of track.getNoteIterator(polyrhythmsToIgnore)) {
    if (index === polyrhthmSnapshot.start)
      startEndNotes[0] = note;
    if (index === polyrhthmSnapshot.end) {
      startEndNotes[1] = note;
      break;
    }
    index++;
  }

  return startEndNotes as [Note, Note];
}
