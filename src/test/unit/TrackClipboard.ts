import {assert} from 'chai';
import {TrackClipboard} from '../../prod/TrackClipboard';
import {isSameTiming} from '../../prod/utils';
import {MockTrack} from '../mocks/MockTrack';
import {MockNote} from '../mocks/MockNote';
import {MockNoteStyle} from '../mocks/MockNoteStyle';

let mockTrack:Banana.Track, target:Banana.TrackClipboard;

describe('TrackClipboard', function() {

  beforeEach(setupTrack);

  it('copies and pastes', () => {
    target.copy({
      start: {bar:1, step:0},
      end: {bar:1, step:2}
    });
    target.paste({
      start: {bar:1, step:3},
      end: {bar:1, step:5}
    });
    checkNoteStyleIds('0', '1', '2', '0', '1', '2', null, '7', '8', '9');
  });

  it('copies and pastes without specifying end', () => {
    target.copy({
      start: {bar:1, step:0},
      end: {bar:1, step:2}
    });
    target.paste({
      start: {bar:1, step:5}
    });
    checkNoteStyleIds('0', '1', '2', '3', '4', '0', '1', '2', '8', '9');
  });

  it("doesn't paste past the end of the track", () => {
    assert.lengthOf(mockTrack.notes, 10);
    target.copy({
      start: {bar:1, step:7},
      end: {bar:1, step:9}
    });
    target.paste({
      start: {bar:1, step:9}
    });
    checkNoteStyleIds('0', '1', '2', '3', '4', '5', null, '7', '8', '7');
    assert.lengthOf(mockTrack.notes, 10);
  });

    it("retains original copied NoteStyles even if track has changed", () => {
      target.copy({
        start: {bar:1, step:2},
        end: {bar:1, step:3}
      });
      const newNoteStyle = MockNoteStyle();
      newNoteStyle.id = '1000';
      mockTrack.notes[2].noteStyle = newNoteStyle;
      target.paste({
        start: {bar:1, step:7}
      });
      checkNoteStyleIds('0', '1', '1000', '3', '4', '5', null, '2', '3', '9');
    });

    it("copies nulls", () => {
      target.copy({
        start: {bar:1, step:5},
        end: {bar:1, step:7}
      });
      target.paste({
        start: {bar:1, step:0}
      });
      checkNoteStyleIds('5', null, '7', '3', '4', '5', null, '7', '8', '9')
    });
});



function setupTrack(): void {
  mockTrack = MockTrack();
  target = new TrackClipboard(mockTrack);
  for (let i = 0; i < 10; i++) {
    const mockNote = mockTrack.notes[i] = MockNote();
    mockNote.timing = {bar:1, step:i};
    mockNote.noteStyle = MockNoteStyle();
    mockNote.noteStyle.id = '' + i;
  }

  // Add a null, make sure that works
  mockTrack.notes[6].noteStyle = null;

  mockTrack.getNoteAt = function(timing:Banana.Timing): Banana.Note {
    for (const note of mockTrack.notes) {
      if (isSameTiming(note.timing, timing))
        return note;
    }
  }

  assertNoteStylesInBaseState();
}


function assertNoteStylesInBaseState() {
  if (!mockTrack?.notes?.length)
    throw 'mockTrack not set up';

  assert.equal(mockTrack.notes[0].noteStyle.id, '0');
  assert(isSameTiming(mockTrack.notes[0].timing, {bar:1, step:0}));
  assert.equal(mockTrack.notes[1].noteStyle.id, '1');
  assert(isSameTiming(mockTrack.notes[1].timing, {bar:1, step:1}));
  assert.equal(mockTrack.notes[2].noteStyle.id, '2');
  assert(isSameTiming(mockTrack.notes[2].timing, {bar:1, step:2}));
  assert.equal(mockTrack.notes[3].noteStyle.id, '3');
  assert(isSameTiming(mockTrack.notes[3].timing, {bar:1, step:3}));
  assert.equal(mockTrack.notes[4].noteStyle.id, '4');
  assert(isSameTiming(mockTrack.notes[4].timing, {bar:1, step:4}));
  assert.equal(mockTrack.notes[5].noteStyle.id, '5');
  assert(isSameTiming(mockTrack.notes[5].timing, {bar:1, step:5}));
  assert.isNull(mockTrack.notes[6].noteStyle);
  assert(isSameTiming(mockTrack.notes[6].timing, {bar:1, step:6}));
  assert.equal(mockTrack.notes[7].noteStyle.id, '7');
  assert(isSameTiming(mockTrack.notes[7].timing, {bar:1, step:7}));
  assert.equal(mockTrack.notes[8].noteStyle.id, '8');
  assert(isSameTiming(mockTrack.notes[8].timing, {bar:1, step:8}));
  assert.equal(mockTrack.notes[9].noteStyle.id, '9');
  assert(isSameTiming(mockTrack.notes[9].timing, {bar:1, step:9}));
}


function checkNoteStyleIds(...noteStyleIds: String[]) {
  noteStyleIds.forEach((id, index) => {
    const noteStyle = mockTrack.notes[index].noteStyle;
    if (id !== null)
      assert.equal(noteStyle.id, id)
    else
      assert.isNull(noteStyle);
  });
}
