global.AudioContext = class {
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

  getOutputTimestamp() {
    return {contextTime:(this.running ? this.contextTime + Date.now() - this.timestamp : this.contextTime) / 1000};
  }
};

global.AudioBuffer = class {};

global.AudioBufferSourceNode = class {
  start() {}
};
