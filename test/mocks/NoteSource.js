export class NoteSource {
  constructor() {
    this.requestLog = [];
  }

  getPlayableNotes(intervalStart, intervalEnd) {
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
