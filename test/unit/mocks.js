import {assert} from 'chai';
import {NoteSource} from '../mocks/NoteSource.js';
import '../mocks/WebAudio.js';

describe('NoteSource mock', () => {
  const noteSource = new NoteSource();
  it('has a log of requested notes', () => assert(Array.isArray(noteSource.requestLog)));
  it('starts with no logged requests', () => assert(noteSource.requestLog.length === 0));
  it('logs requests correctly', () => {
    const intervalStart = 1;
    const intervalEnd = 530453080;
    noteSource.getPlayableNotes(intervalStart, intervalEnd);
    assert(noteSource.requestLog.length === 1);
    assert(noteSource.requestLog[0].length === 2);
    assert(noteSource.requestLog[0][0] === intervalStart);
    assert(noteSource.requestLog[0][1] === intervalEnd);
  });
});
