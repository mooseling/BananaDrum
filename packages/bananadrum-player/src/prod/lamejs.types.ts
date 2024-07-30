export interface LameJS {
  Mp3Encoder(channelCount:number, sampleRate:number, bitRate:number): Mp3Encoder
}

interface Mp3Encoder {
  encodeBuffer(leftChunk:Int16Array, rightChunk:Int16Array): Int8Array
  flush(): Int8Array
}
