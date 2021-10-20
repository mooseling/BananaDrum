interface AudioPlayer {
  play(): void
  pause(): void
}

interface AudioBufferCache {
  get(key:ArrayBuffer): AudioBuffer|Promise<AudioBuffer>|undefined
  set(key:ArrayBuffer, thing:AudioBuffer|Promise<AudioBuffer>): void
}
