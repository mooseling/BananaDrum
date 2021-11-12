import {Track} from './Track';
import {TimeParams} from './TimeParams';

const defaultTimeParams = {timeSignature:'4/4', tempo:120, length:1};

export const Arrangement:ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(library:Library, packedArrangement?:PackedArrangement): Arrangement {
  const timeParams = TimeParams(packedArrangement?.timeParams || defaultTimeParams);
  const tracks:Track[] = [];
  const arrangement:Arrangement = {library, timeParams, tracks, getAudioEvents, getSixteenths};
  if (packedArrangement)
    packedArrangement.packedTracks.forEach(packedTrack => tracks.push(Track.unpack(arrangement, packedTrack)));

  return arrangement;


  function getAudioEvents(interval:Interval): AudioEvent[] {
    const audioEvents:AudioEvent[] = [];
    tracks.forEach(track => audioEvents.push(...track.getAudioEvents(interval)));
    return audioEvents;
  }


  // Returns an array of timings, representing each sixteenth in the arrangement
  // The UI uses it to generate all the note-viewers
  function getSixteenths(): Timing[] {
    const [beatUnit, beatsPerBar] = timeParams.timeSignature.split('/').map(value => Number(value));
    const bars: number = timeParams.length;
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
