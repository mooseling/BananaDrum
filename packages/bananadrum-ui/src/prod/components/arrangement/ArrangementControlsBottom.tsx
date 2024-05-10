import { Arrangement } from 'bananadrum-core';
import { useContext, useState } from 'react';
import { ArrangementPlayerContext } from './ArrangementViewer.js';
import { Overlay, toggleOverlay } from '../Overlay.js';
import { ExpandingSpacer } from '../ExpandingSpacer.js';
import { SmallSpacer } from '../SmallSpacer.js';
import { useSubscription } from '../../hooks/useSubscription.js'
import { useArrangementAndTracksSubscription } from '../../hooks/useArrangementAndTracksSubscription.js'
import { ModeManagerContext } from '../../BananaDrumUi.js';



export function ArrangementControlsBottom(): JSX.Element {
  const arrangement:Arrangement = useContext(ArrangementPlayerContext).arrangement;
  const modeManager = useContext(ModeManagerContext);

  const [arePolyrhythms, setArePolyrhythms] = useState(hasPolyrhythms(arrangement));
  useArrangementAndTracksSubscription(arrangement, () => {
    const arePolyrhythms = hasPolyrhythms(arrangement);
    if (!arePolyrhythms) {
      toggleOverlay('delete_polyrhythms', 'hide');
      modeManager.deletePolyrhythmMode = false;
    }
    setArePolyrhythms(arePolyrhythms);
  });

  useSubscription(modeManager, () => {
    if (!modeManager.deletePolyrhythmMode)
      toggleOverlay('delete_polyrhythms', 'hide');
  });

  return (
    <div className="arrangement-controls arrangement-controls-bottom overlay-wrapper">
      <button
        className="push-button"
        onClick={() => toggleOverlay('instrument_browser', 'show')}
      >Add Instrument</button>

      <SmallSpacer />
      <ExpandingSpacer />

      {
        arePolyrhythms
        ? (
          <>
            <button
              className="push-button"
              onClick={() => (modeManager.deletePolyrhythmMode = true, toggleOverlay('delete_polyrhythms', 'show'))}
            >Delete polyrhythms...</button>
            <SmallSpacer />
          </>
        )
        : (<></>)
      }

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
            onClick={() => (arrangement.tracks.forEach(track => track.clear), toggleOverlay('clear_tracks', 'hide'))}
          >Really, clear tracks</button>
          <SmallSpacer />
          <button
            className="push-button"
            onClick={() => toggleOverlay('clear_tracks', 'hide')}
          >No, go back</button>
        </div>
      </Overlay>

      <Overlay name="delete_polyrhythms">
        <div style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <ExpandingSpacer />
          <button
            className="push-button"
            onClick={() => modeManager.deletePolyrhythmMode = false}
          >Done</button>
        </div>
      </Overlay>
    </div>
  );
}


function hasPolyrhythms(arrangement:Arrangement): boolean {
  for (const track of arrangement.tracks) {
    if (track.polyrhythms.length)
      return true;
  }

  return false;
}
