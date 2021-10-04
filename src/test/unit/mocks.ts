/* global fetch */
import {assert} from 'chai';
import {NoteSource} from '../mocks/NoteSource.js';
import '../mocks/WebAudio.js';
import '../mocks/fetch.js';


describe('NoteSource mock', function() {
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


describe('fetch() mock', function() {
  const url = 'hello/borp';
  const fetchPromise = fetch(url); // Will be a promise at this point
  const requestLog = fetch.getRequestLog();
  const latestRequest = requestLog[requestLog.length - 1];

  let promiseResolver;
  const arrayBufferPromise = new Promise(resolve => promiseResolver = resolve);

  it('requests the correct path', () => assert(latestRequest === url));

  it('returns a response we can get an ArrayBuffer from...', async () => {
    const response = await fetchPromise;
    const arrayBuffer = await response.arrayBuffer();
    promiseResolver(arrayBuffer); // To pass this onto later tests...
    assert(arrayBuffer instanceof ArrayBuffer);
  });

  it('...and the ArrayBuffer has the url attached', async () => {
    const arrayBuffer = await arrayBufferPromise;
    assert(arrayBuffer.requestUrl === url);
  });
});
