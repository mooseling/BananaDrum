import { TrackView } from 'bananadrum-core';
import { SoloMuteButtons } from './SoloMuteButtons.js';
import { getTrackColour } from '../../track-colour.js';


export function TrackMeta({track, toggleControls}
  : {track:TrackView, toggleControls:() => void}
): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div
      className="track-meta"
      style={{backgroundColor:getTrackColour(track)}}
    >
      {instrumentName}
      <div className="buttons-wrapper">
        <SoloMuteButtons />
        <button className="options-button push-button small gray" onClick={toggleControls}>
          <img src="images/icons/wrench.svg" alt="options"/>
        </button>
      </div>
    </div>
  );
}