import { TimeParams, Arrangement, Track, Instrument } from './types.js';
import { createTrack } from './Track.js';
import { createPublisher } from './Publisher.js';

export function createArrangement(timeParams:TimeParams): Arrangement {
  const publisher = createPublisher();
  const tracks:Track[] = [];
  const arrangement:Arrangement = {timeParams, tracks, addTrack, removeTrack, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  return arrangement;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  // We keep tracks in order right here, so the rest of the app doesn't have to fiddle around figuring this out
  function addTrack(instrument:Instrument): Track {
    const index = tracks.findIndex(track => track.instrument.displayOrder > instrument.displayOrder);
    const track = createTrack(arrangement, instrument);
    if (index === -1)
      tracks.push(track);
    else
      tracks.splice(index, 0, track);
    publisher.publish();
    return track;
  }


  function removeTrack(trackToRemove:Track) {
    const index = tracks.indexOf(trackToRemove);
    if (index !== -1) {
      tracks.splice(index, 1);
      publisher.publish();
      return true;
    } else {
      console.warn("Tried to remove a track but no reference to it. id: " + trackToRemove.id);
    }
  }
}
