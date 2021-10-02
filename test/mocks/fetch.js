const requestLog = [];

global.fetch = async function(path) {
  requestLog.push(path);
  return new ResponseMock();
};

global.fetch.getRequestLog = () => requestLog;

class ResponseMock {
  constructor() {}

  // We use arrayBuffer() for fetching audio files
  async arrayBuffer() {
    return new ArrayBuffer();
  }
}
