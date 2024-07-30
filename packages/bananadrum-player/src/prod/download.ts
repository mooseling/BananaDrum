import { Note } from "bananadrum-core";
import { LameJS } from "./lamejs.types";
import { ArrangementPlayer, TrackPlayer } from "./types";

declare const lamejs: LameJS;

type Samples = number;


const BIT_RATE = 44100; // Samples per second


export function createMp3Url(data:BlobPart[]) {
  const blob = new Blob(data, {type: 'audio/mp3'});
  return window.URL.createObjectURL(blob);
}


export function determineLength(arrangementPlayer:ArrangementPlayer): Samples {
  let length:Samples = 0;

  arrangementPlayer.trackPlayers.forEach(trackPlayer => {
    const track = trackPlayer.track;
    for (const note of track.getNoteIterator()) {
      if (!note.noteStyle)
        continue;

      const noteStart:Samples = getNoteStart(note, trackPlayer);
      const noteEnd:Samples = noteStart + note.noteStyle.audioBuffer.length;

      if (noteEnd > length)
        length = noteEnd;
    }
  });

  return length;
}


export function determineChannelCount(arrangementPlayer: ArrangementPlayer) {
  let channelCount = 0;

  arrangementPlayer.trackPlayers.forEach(trackPlayer => {
    const track = trackPlayer.track;
    for (const note of track.getNoteIterator()) {
      if (!note.noteStyle)
        continue;

      if (note.noteStyle.audioBuffer.numberOfChannels > channelCount)
        channelCount = note.noteStyle.audioBuffer.numberOfChannels;
    }
  });

  return channelCount;
}


export function mixTrack(trackPlayer:TrackPlayer, targetAudioDataInChannels:Float32Array[]) {
  const track = trackPlayer.track;

  for (const note of track.getNoteIterator()) {
    if (!note.noteStyle)
      continue; // This is a rest, there is no audio to mix here

    const noteStart:Samples = getNoteStart(note, trackPlayer);
    const audioBuffer = note.noteStyle.audioBuffer;

    // Loop over each channel we want to end up with. 2 for stereo, 1 for mono, more for future spatial sound bananas
    targetAudioDataInChannels.forEach((target, channelIndex) => {
      // Some source audio files are mono, some are stereo. We either match the target channel, or just take the first one
      const sourceChannelIndex = audioBuffer.numberOfChannels > channelIndex ? channelIndex : 0;

      audioBuffer.getChannelData(sourceChannelIndex).forEach((amplitude, localIndex) => {
        const targetIndex = noteStart + localIndex;
        const mixedAmplitude = target[targetIndex] + amplitude; // Mixing two tracks is just summing their amplitudes at each sample
        target[targetIndex] = Math.min(mixedAmplitude, 1); // But 1 is the max in the AudioBuffer format
      });
    });
  }
}


function getNoteStart(note:Note, trackPlayer:TrackPlayer): Samples {
  return Math.round(trackPlayer.getNoteTime(note) * BIT_RATE);
}


// Rescale from [-1.0, 1.0] floats to [-32768, 32767] ints
export function rescaleData(floatArray:Float32Array): Int16Array {
  const intArray = new Int16Array(floatArray.length);

  for (let index = 0; index < floatArray.length; index++) {
    if (floatArray[index] >= 0)
      intArray[index] = Math.floor(floatArray[index] * 32_767);
    else
      intArray[index] = Math.floor(floatArray[index] * 32_768);
  }

  return intArray;
}


export function mp3Encode(leftChannelData:Int16Array, rightChannelData?:Int16Array): BlobPart[] {
  const encoder = lamejs.Mp3Encoder(2, 44100, 320); // 128
  const sampleBlockSize = 1152;

  const mp3Data:BlobPart[] = [];

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
