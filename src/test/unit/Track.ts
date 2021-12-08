import {assert} from 'chai';
import {Track} from '../../prod/Track';
import {Library} from '../../prod/Library';
import {createTestEcosystem} from '../lib/createTestEcosystem';

// We want to makes sure the timings we use in these tests are never used again
// Use this function for creating all timing test values
import {getUniqueTiming} from '../lib/getUniqueTiming';


describe('Track', function() {
  let instrument: undefined|Banana.Instrument;
  let track: undefined|Banana.Track;
  let updateCount = 0;
  const logUpdate = () => updateCount++;

  before('Load arrangement', () => createTestEcosystem().then(async ({arrangement}) => {
    instrument = await Library.getInstrument('snare');
    track = Track(arrangement, instrument); // Initialise a track with no notes yet
    track.subscribe(logUpdate);
  }));

  // it('can have notes added', () => {
  //   const initialNoteCount = track.notes.length;
  //   const timing = getUniqueTiming();
  //   track.edit({timing, newValue:'accent'});
  //   const newCount = track.notes.length;
  //   assert(newCount === initialNoteCount + 1);
  //   assert(track.notes[newCount - 1].noteStyle.noteStyleId === 'accent');
  // });

  it('notifies subscribers when edited', () => {
    const initialUpdateCount = updateCount;
    const timing = getUniqueTiming();
    track.edit({timing, newValue:'accent'});
    const newCount = updateCount;
    assert(newCount === initialUpdateCount + 1);
  });

  it('can be asked for a note at a timing', () => {
    const timing = getUniqueTiming();
    const noteStyleId = 'sidestick'
    track.edit({timing, newValue:noteStyleId});
    const note = track.getNoteAt(timing);
    assert(note);
    assert(note.noteStyle.noteStyleId === noteStyleId);
    assert(note.timing === timing);
  });

  it("...and returns a null-note if there isn't one at that time", () => {
    const timing = getUniqueTiming();
    const note = track.getNoteAt(timing);
    assert(note.noteStyle === null);
  });

  it('allows deleting notes', () => {
    const timing = getUniqueTiming();
    track.edit({timing, newValue:'accent'});
    const note = track.getNoteAt(timing);
    assert(note);
    track.edit({timing, newValue:null});
    const deletedNote = track.getNoteAt(timing);
    assert(deletedNote.noteStyle === null);
  });

  // it('deletes just the note you asked for', function() {
  //   const timing1 = getUniqueTiming();
  //   const timing2 = getUniqueTiming();
  //   const timing3 = getUniqueTiming();
  //   track.edit({timing:timing1, newValue:'accent'});
  //   track.edit({timing:timing2, newValue:'accent'}); // going to delete just this one
  //   track.edit({timing:timing3, newValue:'accent'});
  //   const initialNoteCount = track.notes.length;
  //   track.edit({timing:timing2, newValue:null});
  //   assert(track.notes.length === initialNoteCount - 1);
  //   assert(track.getNoteAt(timing2).noteStyle === null);
  // });

  it('notifies subscribers after deleting a note', () => {
    const timing = getUniqueTiming();
    track.edit({timing, newValue:'accent'});
    const initialUpdateCount = updateCount;
    track.edit({timing, newValue:null});
    const newCount = updateCount;
    assert(newCount === initialUpdateCount + 1);
  });
});
