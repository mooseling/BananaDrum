import * as log from '../lib/logging.js';



const requestLog:string[] = log.get('fetchRequestLog') || log.set('fetchRequestLog', []);
export async function fetchMock(requestUrl:string) {
  requestLog.push(requestUrl);
  return new ResponseMock(requestUrl);
}



const arrayBufferLog:Map<ArrayBuffer, string> = log.get('arrayBuffers') || log.set('arrayBuffers', new Map());
class ResponseMock {
  requestUrl: string;
  constructor(requestUrl: string) {
    this.requestUrl = requestUrl;
  }

  // We use arrayBuffer() for fetching audio files
  async arrayBuffer() {
    const arrayBuffer = new ArrayBuffer(8);
    arrayBufferLog.set(arrayBuffer, this.requestUrl); // We want to check this in tests
    return arrayBuffer;
  }
}
