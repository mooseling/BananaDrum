import {assert} from 'chai';
import * as Library from '../../dist/Library.js';
import {instrumentCollection} from '../lib/example-instruments.js';

describe('Library', function() {
  const loadPromise = Library.load(instrumentCollection);

  it('returns ArrayBuffers', async () => {
    await loadPromise;
    assert(Library.getAudio('kick', 'kick') instanceof ArrayBuffer);
    assert(Library.getAudio('snare', 'accent') instanceof ArrayBuffer);
    assert(Library.getAudio('hihat', 'closed') instanceof ArrayBuffer);
  });

  it('returns the correct ArrayBuffers', async () => {
    await loadPromise;
    assert(Library.getAudio('kick', 'kick').requestUrl === 'sounds/kick.mp3');
    assert(Library.getAudio('snare', 'accent').requestUrl === 'sounds/snare.mp3');
    assert(Library.getAudio('hihat', 'closed').requestUrl === 'sounds/hihat.mp3');
  });
});
