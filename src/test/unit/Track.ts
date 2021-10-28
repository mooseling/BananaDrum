import {assert} from 'chai';
import {Track} from '../../prod/Track';
import {createTestEcosystem} from '../lib/createTestEcosystem';

// We want to makes sure the timings we use in these tests are never used again
// Use this function for creating all timing test values
import {getUniqueTiming} from '../lib/getUniqueTiming';


describe('Track', function() {
  let instrument: undefined|Instrument;
  let track: undefined|Track;
  let updateCount = 0;
  const logUpdate = () => updateCount++;

  before('Load arrangement', () => createTestEcosystem().then(({library}) => {
    instrument = library.instruments.snare;
    track = Track(instrument); // Initialise a track with no notes yet
    track.subscribe(logUpdate);
  }));

  it('can have notes added', () => {
    const initialNoteCount = track.notes.length;
    const timing = getUniqueTiming();
    track.edit({timing, newValue:'accent'});
    const newCount = track.notes.length;
    assert(newCount === initialNoteCount + 1);
    assert(track.notes[newCount - 1].noteStyle.noteStyleId === 'accent');
  });

  it('notifies subscribers when edited', () => {
    const initialUpdateCount = updateCount;
    const timing = getUniqueTiming();
    track.edit({timing, newValue:'accent'});
    const newCount = updateCount;
    assert(newCount === initialUpdateCount + 1);
  });

  it('can be asked for a note at a timing', () => {
    const timing = getUniqueTiming();
    const noteStyleId = 'roll'
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

  it('notifies subscribers after deleting a note', () => {
    const timing = getUniqueTiming();
    track.edit({timing, newValue:'accent'});
    const initialUpdateCount = updateCount;
    track.edit({timing, newValue:null});
    const newCount = updateCount;
    assert(newCount === initialUpdateCount + 1);
  });
});
