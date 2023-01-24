// export class NoteEventSourceMock implements NoteEventSource {
//   requestLog: [number, number][];
//   library:Library;
//
//   constructor(library:Library) {
//     this.requestLog = [];
//     this.library = library;
//   }
//
//   getNoteEvents(interval):NoteEvent[] {
//     this.requestLog.push([interval.start, interval.end]);
//     return [
//       {
//         realTime: 0,
//         note: {
//           timing: '1',
//           instrumentId: 'kick',
//           styleId: 'kick'
//         }
//       }
//     ];
//   }
// }
