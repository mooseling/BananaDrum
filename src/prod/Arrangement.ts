import {Track} from './Track';
import {TimeParams} from './TimeParams';
import {Publisher} from './Publisher';

const defaultTimeParams = {timeSignature:'4/4', tempo:120, length:1};

// Track-ids need to be unique, so we simply bung a globally increasing counter on them
let trackCounter = 0;

export const Arrangement:Banana.ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(timeParams?:Banana.TimeParams): Banana.Arrangement {
  if (!timeParams)
    timeParams = TimeParams(defaultTimeParams);

  const publisher:Banana.Publisher = Publisher();
  const tracks:{[trackId:string]:Banana.Track} = {};
  const arrangement:Banana.Arrangement = {timeParams, tracks, createTrack, unpackTracks, removeTrack, getSixteenths, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

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


  function createTrack(instrument:Banana.Instrument) {
    const track = Track(arrangement, instrument)
    const trackId = getTrackId(track);
    tracks[trackId] = track;
    publisher.publish();
  }


  async function unpackTracks(packedTracks:Banana.PackedTrack[]) {
    const trackMap:Map<Banana.PackedTrack, Banana.Track> = new Map();

    // Unpacking tracks is async, but we want them to end up in the right order
    // So we unpack them all randomly...
    await Promise.all(packedTracks.map(async packedTrack => {
      const track = await Track.unpack(arrangement, packedTrack);
      trackMap.set(packedTrack, track);
    }));

    // And then add them in the right order
    packedTracks.forEach(packedTrack => {
      const track = trackMap.get(packedTrack);
      const trackId = getTrackId(track);
      tracks[trackId] = track;
    });

    publisher.publish();
  }


  function removeTrack(trackToRemove:Banana.Track) {
    Object.keys(tracks).some(trackId => {
      if (tracks[trackId] === trackToRemove) {
        delete tracks[trackId];
        publisher.publish();
        return true;
      }
    });
  }
};






// ==================================================================
//                       Public Static Functions
// ==================================================================



arrangementBuilder.unpack = async function(packedArrangement:Banana.PackedArrangement): Promise<Banana.Arrangement> {
  const timeParams = TimeParams(packedArrangement.timeParams);
  const arrangement = Arrangement(timeParams);
  await arrangement.unpackTracks(packedArrangement.packedTracks);
  return arrangement;
}






// ==================================================================
//                       Private Static Functions
// ==================================================================



// We need unique identifiers for tracks, even if their instrument is the same
// This needs to work even if instruments have been deleted
function getTrackId(track:Banana.Track): string {
  const thisInstrumentId = track.instrument.instrumentId;
  trackCounter++;
  return `${thisInstrumentId}--${trackCounter}`;
}
