export class NoteSource {
  constructor() {
    this.requestLog = [];
  }

  getNotes(intervalStart, intervalEnd) {
    this.requestLog.push([intervalStart, intervalEnd]);
  }
}
