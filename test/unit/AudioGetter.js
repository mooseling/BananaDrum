/* global fetch */
import {assert} from 'chai';
import '../mocks/fetch.js';
import * as AudioGetter from '../../dist/AudioGetter.js';

describe('AudioGetter', function() {
  const filename = 'boop.mp3';
  const audioPromise = AudioGetter.get(filename);
  const requestLog = fetch.getRequestLog();
  const latestRequest = requestLog[requestLog.length - 1];

  it('requests the correct file', () => assert(latestRequest.endsWith(filename)));

  it('returns a promise for an ArrayBuffer', async () => {
    const audio = await audioPromise;
    assert(audio instanceof ArrayBuffer);
  });
});
