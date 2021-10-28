import {Track} from './Track';

export const Arrangement:ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(library:Library, packedArrangement?:PackedArrangement): Arrangement {
  let {timeSignature, tempo, length} = packedArrangement || {timeSignature:'4/4', tempo:120, length:1};
  const tracks:Track[] = [];
  const arrangement:Arrangement = {library, timeSignature, tempo, length, tracks, getSixteenths};
  if (packedArrangement)
    packedArrangement.packedTracks.forEach(packedTrack => tracks.push(Track.unpack(arrangement, packedTrack)));

  return arrangement;


  function getSixteenths(): Timing[] {
    const [beatUnit, beatsPerBar] = (this.timeSignature as string).split('/').map(value => Number(value));
    const bars: number = this.length;
    const sixteenthsPerBeat = 16 / beatUnit;
    const sixteenths: Timing[] = [];

    // A possible optimisation is to initialise sixteenths as new Array(sixteenthCount)
    // (sixteenthCount = sixteenthsPerBar * bars)
    // This removes all calls to push, but you'll have to track sixteenths in a variable

    for (let bar = 1; bar <= bars; bar++) {
      for (let beat = 1; beat <= beatsPerBar; beat++) {
        for (let sixteenth = 1; sixteenth <= sixteenthsPerBeat; sixteenth++) {
          sixteenths.push(`${bar}.${beat}.${sixteenth}`);
        }
      }
    }
    return sixteenths;
  }
};
