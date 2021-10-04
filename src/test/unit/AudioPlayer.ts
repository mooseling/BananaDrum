import {assert} from 'chai';
import {NoteSource} from '../mocks/NoteSource.js';
import '../mocks/WebAudio.js';
import {AudioPlayer} from '../../dist/AudioPlayer.js';
import * as Library from '../../dist/Library.js';
import {promiseTimeout} from '../lib/promiseTimeout.js';
import {instrumentCollection} from '../lib/example-instruments.js';

describe('AudioPlayer', function() {
  Library.load(instrumentCollection);
  const noteSource = new NoteSource(Library);
  const requestLog = noteSource.requestLog;
  const audioPlayer = new AudioPlayer(noteSource);


  it('doesn\'t request any notes initially', () => assert(requestLog.length === 0));

  it('starts making requests when asked to play', async () => {
    audioPlayer.play();
    await promiseTimeout(() => assert(requestLog.length > 0), 100);
  });

  it('makes more than one request per second', async () => {
    const initialRequestCount = requestLog.length;
    await promiseTimeout(() => 0, 1000);
    const newRequestCount = requestLog.length - initialRequestCount;
    if (newRequestCount <= 1) {
      console.log(`AudioPlayer only made ${newRequestCount} requests for notes. Here they are:`);
      console.log(requestLog);
    }
    assert(newRequestCount > 1);
  });

  it('stops making requests when asked to pause', async () => {
    audioPlayer.pause();
    const requestNumber = requestLog.length;
    await promiseTimeout(() => assert(requestLog.length === requestNumber), 1000);
  });

  it('requests time intervals with positive length', () => requestLog.forEach(request => assert(request[0] < request[1])));

  it('requests intervals in increasing order', () => {
    let lastRequestStart = requestLog[0][0];
    for (let i = 1; i < requestLog.length; i++) {
      let thisRequestStart = requestLog[i][0];
      if (thisRequestStart <= lastRequestStart) {
        console.log('Test will fail: thisRequestStart <= lastRequestStart');
        console.log(`(${thisRequestStart} <= ${lastRequestStart})`);
        console.log("Here's the whole thing");
        console.log(requestLog);
      }
      assert(thisRequestStart > lastRequestStart);
      lastRequestStart = thisRequestStart;
    }
  });

  it('makes requests that cover a continuous interval', () => {
    let lastRequestEnd = requestLog[0][1];
    for (let i = 1; i < requestLog.length; i++) {
      let thisRequestStart = requestLog[i][0];
      if (thisRequestStart > lastRequestEnd) {
        console.log('Request log:');
        console.log(requestLog);
      }
      assert(thisRequestStart <= lastRequestEnd);
      lastRequestEnd = requestLog[i][1];
    }
  });
});
