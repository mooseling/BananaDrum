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
  const tracks:{[trackId:string]:Banana.Track} = {};
  const arrangement:Banana.Arrangement = {timeParams, tracks, createTrack, unpackTracks, removeTrack, subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe};

  return arrangement;






  // ==================================================================
  //                          Public Functions
  // ==================================================================


  function createTrack(instrument:Banana.Instrument): Banana.Track {
    const trackId = getTrackId();
    const track = tracks[trackId] = Track(arrangement, instrument);
    publisher.publish();
    return track;
  }


  async function unpackTracks(packedTracks:Banana.PackedTrack[]) {
    packedTracks.forEach(packedTrack => {
      const track = Track.unpack(arrangement, packedTrack);
      const trackId = getTrackId();
      tracks[trackId] = track;
    })
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



arrangementBuilder.unpack = function(packedArrangement:Banana.PackedArrangement): Banana.Arrangement {
  const timeParams = TimeParams(packedArrangement.timeParams);
  const arrangement = Arrangement(timeParams);
  arrangement.unpackTracks(packedArrangement.packedTracks);
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
