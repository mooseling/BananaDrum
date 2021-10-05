export class NoteSourceMock implements NoteSource {
  requestLog: [number, number][];
  library:Library;

  constructor(library:Library) {
    this.requestLog = [];
    this.library = library;
  }

  getPlayableNotes(intervalStart:number, intervalEnd:number) {
    this.requestLog.push([intervalStart, intervalEnd]);
    return [
      {
        realTime: 0,
        note: {
          timing: '1',
          instrumentId: 'kick',
          styleId: 'kick'
        }
      }
    ];
  }
}
