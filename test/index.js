import {assert} from 'chai';
import {NoteSource} from './mocks/NoteSource.js';
import './mocks/WebAudio.js';
import {AudioPlayer} from '../dist/AudioPlayer.js';
import {promiseTimeout} from './lib/promiseTimeout.js';

describe('Test script', () => {
  it('is running', () => undefined);
});

describe('NoteSource mock', () => {
  const noteSource = new NoteSource();
  it('has a log of requested notes', () => assert(Array.isArray(noteSource.requestLog)));
  it('starts with no logged requests', () => assert(noteSource.requestLog.length === 0));
  it('logs requests correctly', () => {
    const intervalStart = 1;
    const intervalEnd = 530453080;
    noteSource.getNotes(intervalStart, intervalEnd);
    assert(noteSource.requestLog.length === 1);
    assert(noteSource.requestLog[0].length === 2);
    assert(noteSource.requestLog[0][0] === intervalStart);
    assert(noteSource.requestLog[0][1] === intervalEnd);
  });
});

describe('AudioPlayer', () => {
  const noteSource = new NoteSource();
  const requestLog = noteSource.requestLog;
  const audioPlayer = new AudioPlayer(noteSource);
  it('doesn\'t request any notes initially', () => assert(requestLog.length === 0));
  it('starts making requests when asked to play', async () => {
    audioPlayer.play();
    await promiseTimeout(() => assert(requestLog.length > 0), 100);
  });
  it('stops making requests when asked to pause', async () => {
    audioPlayer.pause();
    const requestNumber = requestLog.length;
    await promiseTimeout(() => assert(requestLog.length === requestNumber), 1000);
  });
  it('makes more than one request per second', () => assert(requestLog.length > 1));
  it('requests time intervals with positive length', () => requestLog.forEach(request => assert(request[0] < request[1])));
  it('requests intervals in increasing order', () => {
    let lastRequestStart = requestLog[0][0];
    for (let i = 1; i < requestLog.length; i++) {
      let thisRequestStart = requestLog[i][0];
      assert(thisRequestStart > lastRequestStart);
      lastRequestStart = thisRequestStart;
    }
  });
});
