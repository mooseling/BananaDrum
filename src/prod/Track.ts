import {Library} from './Library';
import {Note} from './Note';
import {Publisher} from './Publisher';
import {getColour} from './colours';
import {isSameTiming} from './utils';

function trackBuilder(arrangement:Banana.Arrangement, instrument:Banana.Instrument, packedNotes:Banana.PackedNote[]): Banana.Track {
  const {timeParams} = arrangement;
  const publisher:Banana.Publisher = Publisher();
  const notes:Banana.Note[] = [];
  const colour = getColour(instrument.colourGroup);
  const track:Banana.Track = {arrangement, instrument, notes, getNoteAt, colour, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  const pulsePoints:Map<Banana.Note, number> = new Map();
  let cachedTimeSignature = timeParams.timeSignature;
  let cachedStepResolution = timeParams.stepResolution;

  if (packedNotes)
    unpackNotes();
  fillInRestsAndSort();
  timeParams.subscribe(handleTimeParamsChange);
  arrangement.subscribe(destroySelfIfNeeded);

  return track;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function getNoteAt(timing:Banana.Timing): Banana.Note {
    for (const note of notes) {
      if (isSameTiming(note.timing, timing))
        return note;
    }
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================


  // Only call if packedNotes is defined
  function unpackNotes(): void {
    packedNotes.forEach(packedNote => {
      const {timing:packedTiming, noteStyleId} = packedNote;
      const timing:Banana.Timing = unpackTiming(packedTiming);
      addNewNote(timing, instrument.noteStyles[noteStyleId]);
    });
  }


  // Return value indicates whether anything changed
  function fillInRestsAndSort(): boolean {
    const timingsWithNoNotes = timeParams.timings
      .filter(timing => !notes.some(note => isSameTiming(note.timing, timing)));
    if (timingsWithNoNotes.length) {
      timingsWithNoNotes.forEach(timing => addNewNote(timing, null));
      notes.sort(chronologically);
      return true;
    }
    return false;
  }


  function addNewNote(timing:Banana.Timing, noteStyle:Banana.NoteStyle): void {
    const note = Note(track, timing, noteStyle);
    pulsePoints.set(note, timeParams.convertToPulses(note.timing));
    notes.push(note);
  }


  function handleTimeParamsChange() {
    let somethingChanged = false;

    if (timeParams.timeSignature !== cachedTimeSignature
      || timeParams.stepResolution !== cachedStepResolution) {
      const newTimings:Map<Banana.Timing, [Banana.Note, number]> = new Map();
      let index = 0;
      while (index < notes.length) {
        const note = notes[index];
        const pulsePoint = pulsePoints.get(note);
        const {bar, step, score} = timeParams.convertToApproxTiming(pulsePoint);
        const newTiming = {bar, step};
        const existingNoteAndScore = newTimings.get(newTiming);
        if (existingNoteAndScore === undefined) {
          newTimings.set(newTiming, [note, score]);
          note.timing = newTiming;
          index++;
        } else {
          if (score > existingNoteAndScore[1]) {
            deleteNote(existingNoteAndScore[0]);
            newTimings.set(newTiming, [note, score]);
            note.timing = newTiming;
          } else {
            deleteNote(note, index);
          }
          somethingChanged = true;
        }
      }
      cachedTimeSignature = timeParams.timeSignature;
      cachedStepResolution = timeParams.stepResolution;
    }

    // Remove invalid notes, e.g. arrangement has shortened
    let index = 0;
    while (index < notes.length) {
      if (!timeParams.isValid(notes[index].timing)) {
        deleteNote(notes[index])
        somethingChanged = true;
      } else {
        index++;
      }
    }

    // Fill in new notes, e.g. arrangement has lengthened
    if(fillInRestsAndSort())
      somethingChanged = true;

    if (somethingChanged)
      publisher.publish();
  }


  function deleteNote(note:Banana.Note, index?:number) {
    if (index === undefined)
      index = notes.indexOf(note);
    notes.splice(index, 1);
    pulsePoints.delete(note);
  }


  function destroySelfIfNeeded() {
    // Check track still exists
    for (const trackId in arrangement.tracks) {
      if (arrangement.tracks[trackId] === track)
        return;
    }
    // ... otherwise unsubscribe from everything
    timeParams.unsubscribe(handleTimeParamsChange);
    arrangement.unsubscribe(destroySelfIfNeeded);
  }
}


trackBuilder.unpack = async function(arrangement:Banana.Arrangement, packedTrack:Banana.PackedTrack): Promise<Banana.Track> {
  const instrument = await Library.getInstrument(packedTrack.instrumentId);
  return Track(arrangement, instrument, packedTrack.packedNotes);
}

export const Track:Banana.TrackBuilder = trackBuilder;



function unpackTiming(packedTiming:Banana.PackedTiming): Banana.Timing {
  const [bar, step] = packedTiming.split(':').map(value => Number(value));
  return {bar, step};
}


function chronologically(note1:Banana.Note, note2:Banana.Note): number {
  return (note1.timing.bar - note2.timing.bar) || (note1.timing.step - note2.timing.step)
}
