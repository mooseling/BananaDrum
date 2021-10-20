import {assert} from 'chai';
import {Library} from '../../prod/Library.js';
import {instrumentCollection} from '../lib/example-instruments.js';
import * as log from '../lib/logging.js';

const library = Library(instrumentCollection);

describe('Library', function() {
  const audioFromLibrary:any = {};
  const arrayBufferLog:Map<ArrayBuffer, string> = log.get('arrayBuffers') || log.set('arrayBuffers', new Map());

  before('Load library', () => {
    return library.load();
    // audioFromLibrary.kick = library.getAudio('kick', 'kick');
    // audioFromLibrary.snare = library.getAudio('snare', 'accent');
    // audioFromLibrary.hihat = library.getAudio('hihat', 'closed');
  });

  // it('returns ArrayBuffers', async () => {
  //   assert(audioFromLibrary.kick instanceof ArrayBuffer);
  //   assert(audioFromLibrary.snare instanceof ArrayBuffer);
  //   assert(audioFromLibrary.hihat instanceof ArrayBuffer);
  // });
  //
  // it('returns the correct ArrayBuffers', async () => {
  //   assert(arrayBufferLog.get(audioFromLibrary.kick) === 'sounds/kick.mp3');
  //   assert(arrayBufferLog.get(audioFromLibrary.snare) === 'sounds/snare.mp3');
  //   assert(arrayBufferLog.get(audioFromLibrary.hihat) === 'sounds/hihat.mp3');
  // });
});
