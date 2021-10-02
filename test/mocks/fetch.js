const requestLog = [];

global.fetch = async function(requestUrl) {
  requestLog.push(requestUrl);
  return new ResponseMock(requestUrl);
};

global.fetch.getRequestLog = () => requestLog;

class ResponseMock {
  constructor(requestUrl) {
    this.requestUrl = requestUrl;
  }

  // We use arrayBuffer() for fetching audio files
  async arrayBuffer() {
    const arrayBuffer = new ArrayBuffer();
    arrayBuffer.requestUrl = this.requestUrl; // We want to check this in tests
    return arrayBuffer;
  }
}
