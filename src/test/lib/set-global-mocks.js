// Plain old javascript file because TS complains about using global
// The real way to fix this is to install node types
// But node types are then flagging errors in my browser code

import {AudioContextMock, AudioBufferMock, AudioBufferSourceNodeMock} from '../mocks/WebAudio.ts';
import {fetchMock} from '../mocks/fetch.ts';

global.AudioContext = AudioContextMock;
global.AudioBuffer = AudioBufferMock;
global.AudioBufferSourceNode = AudioBufferSourceNodeMock;
global.fetch = fetchMock;
