import {AudioContextMock, AudioBufferMock, AudioBufferSourceNodeMock} from '../dist/test/mocks/WebAudio.js';
import {fetchMock} from '../dist/test/mocks/fetch.js';

global.AudioContext = AudioContextMock;
global.AudioBuffer = AudioBufferMock;
global.AudioBufferSourceNode = AudioBufferSourceNodeMock;
global.fetch = fetchMock;
