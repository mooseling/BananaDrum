import * as mockLog from './MockLogging.js';

interface TrackedArrayBuffer extends ArrayBuffer {
  requestUrl?: string
}

const requestLog:string[] = mockLog.get('fetchRequestLog') || mockLog.set('fetchRequestLog', []);
export async function fetchMock(requestUrl:string) {
  requestLog.push(requestUrl);
  return new ResponseMock(requestUrl);
}



class ResponseMock {
  requestUrl: string;
  constructor(requestUrl: string) {
    this.requestUrl = requestUrl;
  }

  // We use arrayBuffer() for fetching audio files
  async arrayBuffer() {
    const arrayBuffer:TrackedArrayBuffer = new ArrayBuffer(8);
    arrayBuffer.requestUrl = this.requestUrl; // We want to check this in tests
    return arrayBuffer;
  }
}
