import {assert} from 'chai';
import {NoteSource} from './mocks/NoteSource.js';
describe('Test script', () => {
  it('is running', () => undefined);
});

describe('NoteSource mock', () => {
  const noteSource = new NoteSource();
  it('has a log of requested notes', () => assert(Array.isArray(noteSource.requestRecord)));
  it('starts with no logged requests', () => assert(noteSource.requestRecord.length === 0));
  it('logs requests correctly', () => {
    const intervalStart = 1;
    const intervalEnd = 530453080;
    noteSource.getNotes(intervalStart, intervalEnd);
    assert(noteSource.requestRecord.length === 1);
    assert(noteSource.requestRecord[0].length === 2);
    assert(noteSource.requestRecord[0][0] === intervalStart);
    assert(noteSource.requestRecord[0][1] === intervalEnd);
  });
});
