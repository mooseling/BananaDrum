import {assert} from 'chai';
import {Library} from '../../prod/Library.js';
import {instrumentCollection} from '../lib/example-instruments.js';

const library = Library();

describe('Library', function() {
  const audioFromLibrary:any = {};

  before('Load library', async () => {
    library.load(instrumentCollection);
    audioFromLibrary.kick = library.getAudio('kick', 'kick');
    audioFromLibrary.snare = library.getAudio('snare', 'accent');
    audioFromLibrary.hihat = library.getAudio('hihat', 'closed');
  });

  it('returns ArrayBuffers', async () => {
    assert(audioFromLibrary.kick instanceof ArrayBuffer);
    assert(audioFromLibrary.snare instanceof ArrayBuffer);
    assert(audioFromLibrary.hihat instanceof ArrayBuffer);
  });

  // it('returns the correct ArrayBuffers', async () => {
  //   await loadPromise;
  //   assert(library.getAudio('kick', 'kick').requestUrl === 'sounds/kick.mp3');
  //   assert(library.getAudio('snare', 'accent').requestUrl === 'sounds/snare.mp3');
  //   assert(library.getAudio('hihat', 'closed').requestUrl === 'sounds/hihat.mp3');
  // });
});
