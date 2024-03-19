import { PackedTimeParams, TimeParams, Arrangement, Track, Instrument, PackedTrack, PackedArrangement } from './types.js';
import { createTrack, unpackTrack } from './Track.js';
import { createTimeParams } from './TimeParams.js';
import { createPublisher } from './Publisher.js';

const defaultTimeParams:PackedTimeParams = {
  timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16
};

export function createArrangement(timeParams?:TimeParams): Arrangement {
  if (!timeParams)
    timeParams = createTimeParams(defaultTimeParams);

  const publisher = createPublisher();
  const tracks:{[trackId:string]:Track} = {};
  const arrangement:Arrangement = {timeParams, tracks, addTrack, unpackTracks, removeTrack, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  return arrangement;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function addTrack(instrument:Instrument): Track {
    const track = createTrack(arrangement, instrument);
    tracks[track.id] = track;
    publisher.publish();
    return track;
  }


  async function unpackTracks(packedTracks:PackedTrack[]) {
    packedTracks.forEach(packedTrack => {
      const track = unpackTrack(arrangement, packedTrack);
      tracks[track.id] = track;
    })
    publisher.publish();
  }


  function removeTrack(trackToRemove:Track) {
    if (tracks[trackToRemove.id]) {
      delete tracks[trackToRemove.id];
      publisher.publish();
      return true;
    } else {
      console.warn("Tried to remove a track but no reference to it. id: " + trackToRemove.id);
    }
  }
};






// ==================================================================
//                       Public Static Functions
// ==================================================================



export function unpackArrangement(packedArrangement:PackedArrangement): Arrangement {
  const timeParams = createTimeParams(packedArrangement.timeParams);
  const arrangement = createArrangement(timeParams);
  arrangement.unpackTracks(packedArrangement.packedTracks);
  return arrangement;
}
