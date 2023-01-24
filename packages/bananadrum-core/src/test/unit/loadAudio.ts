/* global fetch */
import {assert} from 'chai';
import '../mocks/fetch';
import {loadAudio} from '../../prod/loadAudio';
import * as log from '../lib/logging';

describe('loadAudio', function() {
  const filename = 'boop.mp3';
  const audioPromise = loadAudio(filename);
  const requestLog = log.get('fetchRequestLog');
  const latestRequest = requestLog[requestLog.length - 1];

  it('requests the correct file', () => assert(latestRequest.endsWith(filename)));

  it('returns a promise for an AudioBuffer', async () => {
    const audio = await audioPromise;
    assert(audio instanceof AudioBuffer);
  });
});
