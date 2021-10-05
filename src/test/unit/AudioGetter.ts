/* global fetch */
import {assert} from 'chai';
import '../mocks/fetch.js';
import {AudioGetter} from '../../prod/AudioGetter.js';
import * as mockLog from '../mocks/MockLogging.js';

describe('AudioGetter', function() {
  const filename = 'boop.mp3';
  const audioPromise = AudioGetter.get(filename);
  const requestLog = mockLog.get('fetchRequestLog');
  const latestRequest = requestLog[requestLog.length - 1];

  it('requests the correct file', () => assert(latestRequest.endsWith(filename)));

  it('returns a promise for an ArrayBuffer', async () => {
    const audio = await audioPromise;
    assert(audio instanceof ArrayBuffer);
  });
});
