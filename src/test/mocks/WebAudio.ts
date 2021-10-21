export class AudioContextMock {
  timestamp:number;
  contextTime:number;
  running:boolean;

  constructor() {
    this.timestamp = Date.now();
    this.contextTime = 0;
    this.running = true;
  }

  suspend() {
    if (this.running) {
      this.running = false;
      this.contextTime += Date.now() - this.timestamp;
      this.timestamp = Date.now();
    }
  }

  resume() {
    if (!this.running) {
      this.running = true;
      this.timestamp = Date.now();
    }
  }

  get currentTime() {
    return (this.running ? this.contextTime + Date.now() - this.timestamp : this.contextTime) / 1000
  }

  decodeAudioData(arrayBuffer:ArrayBuffer): Promise<AudioBufferMock> {
    const audioBufferMock = new AudioBufferMock();
    const promise = new Promise(resolve => resolve(audioBufferMock));
    return promise;
  }
};

export class AudioBufferMock {};

export class AudioBufferSourceNodeMock {
  connect() {}
  start() {}
};
