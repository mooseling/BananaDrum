import { ArrangementSnapshot, PolyrhythmSnapshot, TrackSnapshot } from '../types/snapshots.js';
import { ArrangementView, PolyrhythmView, TrackView } from '../types/types.js';



export function getArrangementSnapshot(arrangement:ArrangementView): ArrangementSnapshot {
  const {timeSignature, tempo, length, pulse, stepResolution} = arrangement.timeParams;
  return {
    title: arrangement.title,
    timeParams: {timeSignature, tempo, length, pulse, stepResolution},
    tracks: arrangement.tracks.map(getTrackSnapshot)
  };
}


function getTrackSnapshot(track:TrackView): TrackSnapshot {
  return {
    id:track.id,
    instrumentId: track.instrument.id,
    notes: getNotesAsChars(track),
    polyrhythms: getPolyrhythmSnapshots(track)
  };
}


function getNotesAsChars(track:TrackView): string[] {
  return Array.from(track.getNoteIterator())
    .map(note => note.noteStyle?.id || '0'); // For rests, note.noteStyle is null, and '0' is reserved for this on all instruments
}


function getPolyrhythmSnapshots(track:TrackView): PolyrhythmSnapshot[] {
  const polyrhythmSnapshots = [];
  const polyrhythmsToIgnore:PolyrhythmView[] = [];

  // We do polyrhythms in reverse order in order to support nested polyrhthms
  // When we rebuild the polyrhythms one-by-one, the note-iterator is going to change after each one
  // When we serialise, we have to mimic that behaviour in reverse

  for (let polyrhythmIndex = track.polyrhythms.length - 1; polyrhythmIndex >= 0; polyrhythmIndex--) {
    const polyrhythm = track.polyrhythms[polyrhythmIndex];
    polyrhythmsToIgnore.push(polyrhythm);
    let start:number;
    let end:number;

    const noteIterator = track.getNoteIterator(polyrhythmsToIgnore);
    let noteIndex = 0;
    for (const note of noteIterator) {
      if (note === polyrhythm.start)
        start = noteIndex;
      if (note === polyrhythm.end) {
        end = noteIndex;
        break;
      }
      noteIndex++;
    }

    polyrhythmSnapshots.unshift({
      id: polyrhythm.id,
      start,
      end,
      length: polyrhythm.notes.length
    });
  }

  return polyrhythmSnapshots;
}