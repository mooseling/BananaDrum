// import {assert} from 'chai';
// import { Note, Timing, Track } from '../../prod/types.js';
// import {TrackClipboard} from '../../prod/TrackClipboard.js';
// import {isSameTiming} from '../../prod/utils.js';
// import {MockTrack} from '../mocks/MockTrack.js';
// import {MockNote} from '../mocks/MockNote.js';
// import {MockNoteStyle} from '../mocks/MockNoteStyle.js';

// let mockTrack:Track, target:TrackClipboard;

// describe('TrackClipboard', function() {

//   beforeEach(setupTrack);

//   it('copies and pastes', () => {
//     target.copy({
//       start: {bar:1, step:1},
//       end: {bar:1, step:3}
//     });
//     target.paste({
//       start: {bar:1, step:3},
//       end: {bar:1, step:5}
//     });
//     checkNoteStyleIds('1', '2', '1', '2', '3', undefined, '7', '8', '9', '10');
//   });

//   it('copies and pastes without specifying end', () => {
//     target.copy({
//       start: {bar:1, step:1},
//       end: {bar:1, step:3}
//     });
//     target.paste({
//       start: {bar:1, step:5}
//     });
//     checkNoteStyleIds('1', '2', '3', '4', '1', '2', '3', '8', '9', '10');
//   });

//   it("doesn't paste past the end of the track", () => {
//     assert.lengthOf(mockTrack.notes, 10);
//     target.copy({
//       start: {bar:1, step:7},
//       end: {bar:1, step:9}
//     });
//     target.paste({
//       start: {bar:1, step:9}
//     });
//     checkNoteStyleIds('1', '2', '3', '4', '5', undefined, '7', '8', '7', '8');
//     assert.lengthOf(mockTrack.notes, 10);
//   });

//     it("retains original copied NoteStyles even if track has changed", () => {
//       target.copy({
//         start: {bar:1, step:2},
//         end: {bar:1, step:3}
//       });
//       const newNoteStyle = MockNoteStyle();
//       newNoteStyle.id = '1000';
//       mockTrack.notes[1].noteStyle = newNoteStyle;
//       target.paste({
//         start: {bar:1, step:7}
//       });
//       checkNoteStyleIds('1', '1000', '3', '4', '5', undefined, '2', '3', '9', '10');
//     });

//     it("copies rests", () => {
//       target.copy({
//         start: {bar:1, step:5},
//         end: {bar:1, step:7}
//       });
//       target.paste({
//         start: {bar:1, step:1}
//       });
//       checkNoteStyleIds('5', undefined, '7', '4', '5', undefined, '7', '8', '9', '10');
//     });
// });



// function setupTrack(): void {
//   mockTrack = MockTrack();
//   target = new TrackClipboard(mockTrack);
//   for (let index = 0; index < 10; index++) {
//     const mockNote = mockTrack.notes[index] = MockNote();
//     const step = index + 1;
//     mockNote.timing = {bar:1, step};
//     mockNote.noteStyle = MockNoteStyle();
//     mockNote.noteStyle.id = '' + step;
//   }

//   // Add a rest, make sure that works
//   mockTrack.notes[5].noteStyle = undefined;

//   mockTrack.getNoteAt = function(timing:Timing): Note {
//     for (const note of mockTrack.notes) {
//       if (isSameTiming(note.timing, timing))
//         return note;
//     }
//   }

//   assertNoteStylesInBaseState();
// }


// function assertNoteStylesInBaseState() {
//   if (!mockTrack?.notes?.length)
//     throw 'mockTrack not set up';

//   checkNoteStyleIds('1', '2', '3', '4', '5', undefined, '7', '8', '9', '10');

//   assert(isSameTiming(mockTrack.notes[0].timing, {bar:1, step:1}));
//   assert(isSameTiming(mockTrack.notes[1].timing, {bar:1, step:2}));
//   assert(isSameTiming(mockTrack.notes[2].timing, {bar:1, step:3}));
//   assert(isSameTiming(mockTrack.notes[3].timing, {bar:1, step:4}));
//   assert(isSameTiming(mockTrack.notes[4].timing, {bar:1, step:5}));
//   assert(isSameTiming(mockTrack.notes[5].timing, {bar:1, step:6}));
//   assert(isSameTiming(mockTrack.notes[6].timing, {bar:1, step:7}));
//   assert(isSameTiming(mockTrack.notes[7].timing, {bar:1, step:8}));
//   assert(isSameTiming(mockTrack.notes[8].timing, {bar:1, step:9}));
//   assert(isSameTiming(mockTrack.notes[9].timing, {bar:1, step:10}));

// }


// function checkNoteStyleIds(...expectedNoteStyleIds: String[]) {
//   expectedNoteStyleIds.forEach((expectedId, index) => {
//     if (!mockTrack.notes[index])
//       throw "no note at " + index;
//     const actualNoteStyle = mockTrack.notes[index].noteStyle;
//     if (expectedId !== undefined) {
//       assert.isDefined(actualNoteStyle, "actualNoteStyle undefined: " + index + ". whole thing: " + stringifyMockTrack());
//       assert.equal(actualNoteStyle.id, expectedId, "actualNoteStyle wrong: " + index + ". whole thing: " + stringifyMockTrack());
//     } else {
//       assert.isUndefined(actualNoteStyle, "actualNoteStyle should be undefined: " + index + ". whole thing: " + stringifyMockTrack());
//     }
//   });
// }

// function stringifyMockTrack() {
//   return mockTrack.notes.map(note => {
//     if (note.noteStyle === undefined)
//       return 'undefined';
//     else
//     return note.noteStyle.id;
//   }).join(', ');
// }
