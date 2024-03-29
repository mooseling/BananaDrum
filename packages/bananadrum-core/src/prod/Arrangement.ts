import { TimeParams, Arrangement, Track, Instrument } from './types.js';
import { createTrack } from './Track.js';
import { createPublisher } from './Publisher.js';

export function createArrangement(timeParams:TimeParams): Arrangement {
  const publisher = createPublisher();
  const tracks:{[trackId:string]:Track} = {};
  const arrangement:Arrangement = {timeParams, tracks, addTrack, removeTrack, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

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


  function removeTrack(trackToRemove:Track) {
    if (tracks[trackToRemove.id]) {
      delete tracks[trackToRemove.id];
      publisher.publish();
      return true;
    } else {
      console.warn("Tried to remove a track but no reference to it. id: " + trackToRemove.id);
    }
  }
}
