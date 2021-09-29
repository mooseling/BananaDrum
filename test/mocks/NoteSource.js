export class NoteSource {
  constructor() {
    this.requestRecord = [];

  }

  getNotes(intervalStart, intervalEnd) {
    this.requestRecord.push([intervalStart, intervalEnd]);
  }
}
