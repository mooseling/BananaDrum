// import {assert} from 'chai';
// import {Library} from '../../prod/Library.js';
// import {instrumentCollection} from '../lib/example-instruments.js';

// Library.load(instrumentCollection);

// describe('Loaded Library', function() {

//   it('has instruments', () => assert(Object.keys(Library.instrumentMetas).length > 0));

//   it('...which have note-styles', async () => {
//     await Promise.all(Library.instrumentMetas.map(async instrumentMeta => {
//       const {id} = instrumentMeta;
//       const instrument = await Library.getInstrument(id);
//       assert(Object.keys(instrument.noteStyles).length);
//     }));
//   });

//   it('...which have AudioBuffers', async () => {
//     await Promise.all(Library.instrumentMetas.map(async instrumentMeta => {
//       const {id} = instrumentMeta;
//       const instrument = await Library.getInstrument(id);
//       for (const noteStyleId in instrument.noteStyles)
//         assert(instrument.noteStyles[noteStyleId].audioBuffer);
//     }));
//   });
// });
