import {Track} from './Track';
import {TimeParams} from './TimeParams';
import {Publisher} from './Publisher';

const defaultTimeParams:Banana.PackedTimeParams = {
  timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16
};

// Track-ids need to be unique, so we simply bung a globally increasing counter on them
let trackCounter = 0;

export const Arrangement:Banana.ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(timeParams?:Banana.TimeParams): Banana.Arrangement {
  if (!timeParams)
    timeParams = TimeParams(defaultTimeParams);

  const publisher:Banana.Publisher = Publisher();
  const tracks:{[trackId:string]:Banana.PotentialTrack} = {};
  const arrangement:Banana.Arrangement = {timeParams, tracks, createTrack, unpackTracks, removeTrack, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  return arrangement;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  async function createTrack(instrument:Banana.Instrument|Promise<Banana.Instrument>):
  Promise<Banana.Track|void> {
    let promise:Promise<Banana.Track|void>;
    const trackId = getTrackId();
    if (instrument instanceof Promise) {
      // If we're waiting on an instrument, we put a pending-track into tracks
      promise = tracks[trackId] = instrument.then(instrument => {
        const track = Track(arrangement, instrument);
        tracks[trackId] = track;
        publisher.publish();
        return track;
      }).catch(() => {
        delete tracks[trackId];
        publisher.publish();
      });
    } else {
      const track = tracks[trackId] = Track(arrangement, instrument);
      promise = new Promise(resolve => resolve(track));
    }
    publisher.publish();
    return promise;
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
      const trackId = getTrackId();
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
function getTrackId(): string {
  trackCounter++;
  return `${trackCounter}`;
}
