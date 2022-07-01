import {Track} from './Track';
import {TimeParams} from './TimeParams';
import {Publisher} from './Publisher';

const defaultTimeParams:Banana.PackedTimeParams = {
  timeSignature:'4/4', tempo:120, length:1, pulse:'1/4', stepResolution:16
};

export const Arrangement:Banana.ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(timeParams?:Banana.TimeParams): Banana.Arrangement {
  if (!timeParams)
    timeParams = TimeParams(defaultTimeParams);

  const publisher:Banana.Publisher = Publisher();
  const tracks:{[trackId:string]:Banana.Track} = {};
  const arrangement:Banana.Arrangement = {timeParams, tracks, createTrack, unpackTracks, removeTrack, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  return arrangement;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function createTrack(instrument:Banana.Instrument): Banana.Track {
    const track = Track(arrangement, instrument);
    tracks[track.id] = track;
    publisher.publish();
    return track;
  }


  async function unpackTracks(packedTracks:Banana.PackedTrack[]) {
    packedTracks.forEach(packedTrack => {
      const track = Track.unpack(arrangement, packedTrack);
      tracks[track.id] = track;
    })
    publisher.publish();
  }


  function removeTrack(trackToRemove:Banana.Track) {
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



arrangementBuilder.unpack = function(packedArrangement:Banana.PackedArrangement): Banana.Arrangement {
  const timeParams = TimeParams(packedArrangement.timeParams);
  const arrangement = Arrangement(timeParams);
  arrangement.unpackTracks(packedArrangement.packedTracks);
  return arrangement;
}
