import { Arrangement } from 'bananadrum-core';
import { useContext } from 'react';
import { ArrangementPlayerContext } from './ArrangementViewer.js';
import { Overlay, toggleOverlay } from '../Overlay.js';
import { ExpandingSpacer } from '../ExpandingSpacer.js';
import { SmallSpacer } from '../SmallSpacer.js';



export function ArrangementControlsBottom(): JSX.Element {
  const arrangement:Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <div className="arrangement-controls arrangement-controls-bottom overlay-wrapper">
      <button
        className="push-button"
        onClick={() => toggleOverlay('instrument_browser', 'show')}
      >Add Instrument</button>
      <ExpandingSpacer />
      <button
        className="push-button"
        onClick={() => toggleOverlay('clear_tracks', 'show')}
      >Clear all tracks</button>
      <Overlay name="clear_tracks">
        <div style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <ExpandingSpacer />
          <button
            className="push-button"
            onClick={() => {
              for (const trackId in arrangement.tracks)
                arrangement.tracks[trackId].clear();
              toggleOverlay('clear_tracks', 'hide');
            }}
          >Really, clear tracks</button>
          <SmallSpacer />
          <button
            className="push-button"
            onClick={() => toggleOverlay('clear_tracks', 'hide')}
          >No, go back</button>
        </div>
      </Overlay>
    </div>
  );
}
