import type { TrackView } from 'bananadrum-core/types';
import { useEditCommand } from '../../hooks/useEditCommand.js';
import { toggleOverlay } from '../Overlay.js';


export function TrackControls(
  {track, overlayName}:{track:TrackView, overlayName:string}): JSX.Element {
    const arrangement = track.arrangement;
    const edit = useEditCommand();

  return (
    <div className="track-controls">
      <button className="push-button gray"
        onClick={() => edit({arrangement, removeTrack:track})}
      >Remove</button>
      <button className="push-button gray"
        onClick={() => {
          edit({track, command:'clear'})
          toggleOverlay(overlayName, 'hide');
        }}
      >Clear</button>
      <button className="push-button gray"
        onClick={() => toggleOverlay(overlayName, 'hide')}
      >Cancel</button>
    </div>
  );
}
