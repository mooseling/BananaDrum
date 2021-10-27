import {Track} from './Track';

export const Arrangement:ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(library:Library, packedArrangement?:PackedArrangement): Arrangement {
  let {timeSignature, tempo, length} = packedArrangement || {timeSignature:'4/4', tempo:120, length:1};
  const tracks:Track[] = [];
  const arrangement:Arrangement = {timeSignature, tempo, length, tracks, getSixteenthCount};
  if (packedArrangement)
    packedArrangement.packedTracks.forEach(packedTrack => tracks.push(Track.unpack(library, packedTrack)));

  return arrangement;


  function getSixteenthCount() {
    const [beatUnit, beatsPerBar] = this.timeSignature.split('/').map(value => Number(value));
    const sixteenthsPerBar = (16 / beatUnit) * beatsPerBar;
    return sixteenthsPerBar * this.length;
  }
};
