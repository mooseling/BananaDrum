import {assert} from 'chai';
import {Library} from '../../prod/Library';
import {instrumentCollection} from '../lib/example-instruments';

const library = Library(instrumentCollection);

describe('Unloaded Library', function() {
  it('throws an error when you access instruments', () => {
    let error:any;
    try {
      library.instruments;
    } catch (thrownThing) {
      error = thrownThing;
    }
    assert(error !== undefined);
  });
});

describe('Loaded Library', function() {
  before('Load library', () => library.load());

  it('has instruments', () => assert(Object.keys(library.instruments).length > 0));

  it('...which have note-styles', () => {
    for (const instrumentId in library.instruments) {
      const instrument = library.instruments[instrumentId];
      assert(Object.keys(instrument.noteStyles).length);
    }
  });

  it('...which have AudioBuffers', () => {
    for (const instrumentId in library.instruments) {
      const instrument = library.instruments[instrumentId];
      for (const noteStyleId in instrument.noteStyles)
        assert(instrument.noteStyles[noteStyleId].audioBuffer);
    }
  });
});
