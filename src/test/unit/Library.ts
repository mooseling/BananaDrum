import {assert} from 'chai';
import {Library} from '../../prod/Library';
import {instrumentCollection} from '../lib/example-instruments';

Library.load(instrumentCollection);

describe('Loaded Library', function() {

  it('has instruments', () => assert(Object.keys(Library.instrumentMetas).length > 0));

  it('...which have note-styles', async () => {
    await Promise.all(Library.instrumentMetas.map(async instrumentMeta => {
      const {instrumentId} = instrumentMeta;
      const instrument = await Library.getInstrument(instrumentId);
      assert(Object.keys(instrument.noteStyles).length);
    }));
  });

  it('...which have AudioBuffers', async () => {
    await Promise.all(Library.instrumentMetas.map(async instrumentMeta => {
      const {instrumentId} = instrumentMeta;
      const instrument = await Library.getInstrument(instrumentId);
      for (const noteStyleId in instrument.noteStyles)
        assert(instrument.noteStyles[noteStyleId].audioBuffer);
    }));
  });
});
