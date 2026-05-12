import type { TrackView } from 'bananadrum-core/types';
import { SoloMuteButtons } from './SoloMuteButtons.js';
import { getTrackColour } from '../../track-colour.js';


export function TrackMeta({track, toggleControls}
  : {track:TrackView, toggleControls:() => void}
): JSX.Element {
  const iconPath = track.instrument.icon;
  return (
    <div
      className="track-meta"
      style={{backgroundColor:getTrackColour(track)}}
    >
      <img src={iconPath}></img>
      <div className="buttons-wrapper">
        <button className="options-button push-button small gray" onClick={toggleControls}>
          <img src="images/icons/wrench.svg" alt="options"/>
        </button>
        <SoloMuteButtons />
      </div>
    </div>
  );
}
