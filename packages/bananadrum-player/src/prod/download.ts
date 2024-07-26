import { Note } from "bananadrum-core";
import { ArrangementPlayer, TrackPlayer } from "./types";


type Samples = number;


const BIT_RATE = 44100; // Samples per second


export function download(arrangementPlayer:ArrangementPlayer) {
  const mixedData = mix(arrangementPlayer);
  console.log(mixedData);

  const scaledData = rescaleData(mixedData);
  console.log(scaledData);

  const mp3Data = mp3Encode(scaledData[0], scaledData[1]);
  console.log(mp3Data);

  const url = createMp3Url(mp3Data)

  return url;
}


export function createMp3Url(data:BlobPart[]) {
  const blob = new Blob(data, {type: 'audio/mp3'});
  return window.URL.createObjectURL(blob);
}


export function mix(arrangementPlayer:ArrangementPlayer): [Float32Array, Float32Array] {
  console.log('Determining Length...');
  const length = determineLength(arrangementPlayer);

  console.log('Creating data arrays')
  const audioDataL = new Float32Array(length);
  const audioDataR = new Float32Array(length);

  console.log('Mixing...');
  arrangementPlayer.trackPlayers.forEach(trackPlayer => {
    const track = trackPlayer.track;
    for (const note of track.getNoteIterator()) {
      if (!note.noteStyle)
        continue;

      const noteStart:Samples = getNoteStart(note, trackPlayer);
      const audioBuffer = note.noteStyle.audioBuffer;

      if (audioBuffer.numberOfChannels === 1) {
        audioBuffer.getChannelData(0).forEach((amplitude, localIndex) => {
          const songIndex = noteStart + localIndex;
          audioDataL[songIndex] = Math.min(audioDataL[songIndex] + amplitude, 1);
          audioDataR[songIndex] = Math.min(audioDataR[songIndex] + amplitude, 1);
        });
      } else {
        audioBuffer.getChannelData(0).forEach((amplitude, localIndex) => {
          const songIndex = noteStart + localIndex;
          audioDataL[songIndex] = Math.min(audioDataL[songIndex] + amplitude, 1);
        });

        audioBuffer.getChannelData(0).forEach((amplitude, localIndex) => {
          const songIndex = noteStart + localIndex;
          audioDataR[songIndex] = Math.min(audioDataR[songIndex] + amplitude, 1);
        });
      }
    }

    console.log(`Track ${track.id} complete`);
  });

  return [audioDataL, audioDataR];
}


export function determineLength(arrangementPlayer:ArrangementPlayer): Samples {
  let length:Samples = 0;

  arrangementPlayer.trackPlayers.forEach(trackPlayer => {
    const track = trackPlayer.track;
    for (const note of track.getNoteIterator()) {
      if (!note.noteStyle)
        continue;

      const noteStart: Samples = getNoteStart(note, trackPlayer);
      const noteEnd:Samples = noteStart + note.noteStyle.audioBuffer.length;

      if (noteEnd > length)
        length = noteEnd;
    }
  });

  return length;
}


function getNoteStart(note:Note, trackPlayer:TrackPlayer): Samples {
  return Math.round(trackPlayer.getNoteTime(note) * BIT_RATE);
}


// Going to try rescaling to Int16Arrays
function rescaleData(floatData:Float32Array[]): Int16Array[] {
  const int16Arrays:Int16Array[] = [];

  floatData.forEach(floatArray => {
    const intArray = new Int16Array(floatArray.length);

    for (let index = 0; index < floatArray.length; index++) {
      if (floatArray[index] >= 0)
        intArray[index] = Math.floor(floatArray[index] * 32_767);
      else
        intArray[index] = Math.floor(floatArray[index] * 32_768);
    }

    int16Arrays.push(intArray);
  });

  return int16Arrays;
}


export function mp3Encode(leftChannelData:Int16Array, rightChannelData?:Int16Array): BlobPart[] {
  const encoder = new window['lamejs'].Mp3Encoder(2, 44100, 320); // 128
  const sampleBlockSize = 1152;

  const mp3Data = [];

  for (let index = 0; index < leftChannelData.length; index += sampleBlockSize) {
    console.log(`Encoding ${index} to ${index + sampleBlockSize}`);

    const leftChunk = leftChannelData.subarray(index, index + sampleBlockSize);
    const rightChunk = rightChannelData?.subarray(index, index + sampleBlockSize);
    const mp3buffer = encoder.encodeBuffer(leftChunk, rightChunk || leftChunk);
    if (mp3buffer.length > 0)
      mp3Data.push(mp3buffer);
  }

  const flush = encoder.flush();
  if (flush.length > 0) {
    console.log('Add flush');
    mp3Data.push(flush);
  }

  return mp3Data;
}
