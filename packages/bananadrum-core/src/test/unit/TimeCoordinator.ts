// import {assert} from 'chai';
// import { TimeParams, Timing } from '../../prod/types.js';
// import {createTimeCoordinator} from '../../prod/TimeCoordinator.js';
// import {createTimeParams} from '../../prod/TimeParams.js';

// type TestCase = [Timing, number];

// describe('TimeCoordinator', function() {
//   describe('Time conversion', function() {
//     describe('4/4 time, 120bpm', function() {
//       const timeParams:TimeParams = createTimeParams({timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16});
//       const timeCoordinator = createTimeCoordinator(timeParams);

//       it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

//       const testCases:TestCase[] = [
//         [{bar:3, step:9}, 5],
//         [{bar:13, step:9}, 25],
//         [{bar:17, step:1}, 32],
//         [{bar:17, step:5}, 32.5],
//         [{bar:19, step:8}, 36.875]
//       ];
//       it('passes a bunch of test cases', () => {
//         testCases.forEach(([timing, expectedRealTime]) => {
//           const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
//           const difference = Math.abs(expectedRealTime - calculatedRealTime);
//           if (difference > 0.00000001)
//             throw `${timing.bar}.${timing.step} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
//         });
//       });
//     });


//     describe('6/8 time, 120bpm', function() {
//       const timeParams:TimeParams = createTimeParams({timeSignature:'6/8', tempo:120, length:1, pulse:'3/8', stepResolution:8});
//       const timeCoordinator = createTimeCoordinator(timeParams);

//       it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

//       const testCases:TestCase[] = [
//         [{bar:1, step:2}, 0.16666666666666666],
//         [{bar:1, step:3}, 0.33333333333333333],
//         [{bar:1, step:4}, 0.5],
//         [{bar:1, step:5}, 0.66666666666666666],
//         [{bar:1, step:6}, 0.83333333333333333],
//         [{bar:2, step:1}, 1],
//         [{bar:2, step:4}, 1.5],
//       ];
//       it('Passes a bunch of test cases', () => {
//         testCases.forEach(([timing, expectedRealTime]) => {
//           const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
//           const difference = Math.abs(expectedRealTime - calculatedRealTime);
//           if (difference > 0.00000001)
//             throw `${timing.bar}.${timing.step} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
//         });
//       });
//     });


//     describe('6/8 time, 140bpm', function() {
//       const timeParams:TimeParams = createTimeParams({timeSignature:'6/8', tempo:140, length:1, pulse:'3/8', stepResolution:8});
//       const timeCoordinator = createTimeCoordinator(timeParams);

//       it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

//       const testCases:TestCase[] = [
//         [{bar:1, step:2}, 0.14285714285714285],
//         [{bar:1, step:3}, 0.2857142857142857],
//         [{bar:1, step:4}, 0.42857142857142855],
//         [{bar:1, step:5}, 0.5714285714285714],
//         [{bar:1, step:6}, 0.7142857142857142],
//         [{bar:2, step:1}, 0.8571428571428571],
//         [{bar:5, step:1}, 3.4285714285714284],
//       ];
//       it('Passes a bunch of test cases', () => {
//         testCases.forEach(([timing, expectedRealTime]) => {
//           const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
//           const difference = Math.abs(expectedRealTime - calculatedRealTime);
//           if (difference > 0.00000001)
//             throw `${timing.bar}.${timing.step} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
//         });
//       });
//     });


//     describe('5/4 time, 90bpm', function() {
//       const timeParams:TimeParams = createTimeParams({timeSignature:'5/4', tempo:90, length:1, pulse:'1/2', stepResolution:8});
//       const timeCoordinator = createTimeCoordinator(timeParams);

//       it('returns 0 on the 1', () => assert(timeCoordinator.convertToRealTime({bar:1,step:1}) === 0));

//       const testCases:TestCase[] = [
//         [{bar:1, step:2}, 0.16666666666666666],
//         [{bar:1, step:3}, 0.33333333333333333],
//         [{bar:1, step:4}, 0.5],
//         [{bar:1, step:5}, 0.66666666666666666],
//         [{bar:1, step:6}, 0.83333333333333333],
//         [{bar:1, step:7}, 1],
//         [{bar:1, step:8}, 1.16666666666666666],
//         [{bar:1, step:9}, 1.33333333333333333],
//         [{bar:1, step:10}, 1.5],
//         [{bar:2, step:1}, 1.66666666666666666],
//         [{bar:100, step:1}, 165],
//       ];
//       it('Passes a bunch of test cases', () => {
//         testCases.forEach(([timing, expectedRealTime]) => {
//           const calculatedRealTime = timeCoordinator.convertToRealTime(timing);
//           const difference = Math.abs(expectedRealTime - calculatedRealTime);
//           if (difference > 0.00000001)
//             throw `${timing.bar}.${timing.step} converted to ${calculatedRealTime} but expected ${expectedRealTime}`;
//         });
//       });
//     });
//   });
// });

// // Removed test cases for tempo changes
// // Relied on old TimeCoordinator.update function to change time
