import {assert} from 'chai';
import {Library} from '../../prod/Library.js';
import {instrumentCollection} from '../lib/example-instruments.js';

const library = Library();

describe('Library', function() {
  const loadPromise = library.load(instrumentCollection);

  it('returns ArrayBuffers', async () => {
    await loadPromise;
    assert(library.getAudio('kick', 'kick') instanceof ArrayBuffer);
    assert(library.getAudio('snare', 'accent') instanceof ArrayBuffer);
    assert(library.getAudio('hihat', 'closed') instanceof ArrayBuffer);
  });

  // it('returns the correct ArrayBuffers', async () => {
  //   await loadPromise;
  //   assert(library.getAudio('kick', 'kick').requestUrl === 'sounds/kick.mp3');
  //   assert(library.getAudio('snare', 'accent').requestUrl === 'sounds/snare.mp3');
  //   assert(library.getAudio('hihat', 'closed').requestUrl === 'sounds/hihat.mp3');
  // });
});
