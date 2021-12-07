import {Track} from './Track';
import {TimeParams} from './TimeParams';

const defaultTimeParams = {timeSignature:'4/4', tempo:120, length:1};

// Track-ids need to be unique, so we simply bung a globally increasing counter on them
let trackCounter = 0;

export const Arrangement:Banana.ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(library:Banana.Library, packedArrangement?:Banana.PackedArrangement): Banana.Arrangement {
  const timeParams = TimeParams(packedArrangement?.timeParams || defaultTimeParams);
  const tracks:{[trackId:string]:Banana.Track} = {};
  const arrangement:Banana.Arrangement = {library, timeParams, tracks, addTrack, getSixteenths};
  if (packedArrangement)
    unpack(packedArrangement);

  return arrangement;






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  // Returns an array of timings, representing each sixteenth in the arrangement
  // The UI uses it to generate all the note-viewers
  function getSixteenths(): Banana.Timing[] {
    const [beatUnit, beatsPerBar] = timeParams.timeSignature.split('/').map((value: string) => Number(value));
    const bars: number = timeParams.length;
    const sixteenthsPerBeat = 16 / beatUnit;
    const sixteenths: Banana.Timing[] = [];

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


  function addTrack(track:Banana.Track) {
    const trackId = getTrackId(track);
    tracks[trackId] = track;
  }






    // ==================================================================
    //                          Private Functions
    // ==================================================================


  function unpack(packedArrangement:Banana.PackedArrangement): void {
    packedArrangement.packedTracks.forEach(packedTrack => {
      const track = Track.unpack(arrangement, packedTrack);
      const trackId = getTrackId(track);
      tracks[trackId] = track;
    });
  }
};



// We need unique identifiers for tracks, even if their instrument is the same
// This needs to work even if instruments have been deleted
function getTrackId(track:Banana.Track): string {
  const thisInstrumentId = track.instrument.instrumentId;
  trackCounter++;
  return `${thisInstrumentId}--${trackCounter}`;
}
