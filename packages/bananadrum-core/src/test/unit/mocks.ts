// import {assert} from 'chai';
// import * as log from '../lib/logging.js';


// describe('Logging', function() {
//   const itemsToLog = [];
//   log.set('logTest', itemsToLog);
//   const returnedVar = log.get('logTest');

//   it('returns things you set', () => assert(returnedVar === itemsToLog));

//   it('is useful for adding things to arrays', () => {
//     itemsToLog[0] = 'boink';
//     assert(returnedVar[0] === 'boink');
//   })
// });


// describe('WebAudio mock', function() {
//   describe('AudioContext Mock', function() {
//     const ctx = new AudioContext();
//     it('can create AudioBuffers', async () => {
//       const arrayBuffer = new ArrayBuffer(8);
//       const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
//       assert(audioBuffer instanceof AudioBuffer);
//     });
//   });
// });


// describe('fetch() mock', function() {
//   const url = 'hello/borp';
//   const fetchPromise = fetch(url); // Will be a promise at this point
//   const requestLog = log.get('fetchRequestLog');
//   const latestRequest = requestLog[requestLog.length - 1];

//   let promiseResolver;
//   const arrayBufferPromise = new Promise(resolve => promiseResolver = resolve);

//   it('requests and logs the correct path', () => assert(latestRequest === url));

//   it('returns a response we can get an ArrayBuffer from...', async () => {
//     const response = await fetchPromise;
//     const arrayBuffer = await response.arrayBuffer();
//     promiseResolver(arrayBuffer); // To pass this onto later tests...
//     assert(arrayBuffer instanceof ArrayBuffer);
//   });
// });
