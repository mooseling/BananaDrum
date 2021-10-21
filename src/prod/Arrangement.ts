import {Track} from './Track.js';

export const Arrangement:ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(library:Library, packedArrangement?:PackedArrangement): Arrangement {
  if (packedArrangement) {
    const {timeSignature, tempo, length} = packedArrangement;
    const arrangement:Arrangement = {timeSignature, tempo, length, tracks:[]};
    packedArrangement.packedTracks.forEach(packedTrack => arrangement.tracks.push(Track.unpack(library, packedTrack)));
    return arrangement;
  }
  return {timeSignature:'4/4', tempo:120, length:1, tracks:[]};
};
