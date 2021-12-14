import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {InstrumentBrowser} from './InstrumentBrowser';
import {Overlay} from './Overlay';
import {useState, useEffect, createContext} from 'react';

export const ArrangementPlayerContext = createContext(null);

export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [tracks, setTracks] = useState({...arrangement.tracks});
  const [instrumentBrowserVisible, toggleBrowser] = useState(false);
  useEffect(() => arrangement.subscribe(() => setTracks({...arrangement.tracks})), []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
      <div className="arrangement-viewer">
        <div className="arrangement-viewer-head">
          <ArrangementControls />
        </div>
        <div className="arrangement-viewer-body overlay-wrapper">
          <div>
            {getTrackViewers(tracks)}
            <button onClick={() => toggleBrowser(true)}>Add</button>
          </div>
          <Overlay visible={instrumentBrowserVisible}>
            <InstrumentBrowser close={() => toggleBrowser(false)}/>
          </Overlay>
        </div>
      </div>
    </ArrangementPlayerContext.Provider>
  );
}


function getTrackViewers(tracks:{[trackId:string]: Banana.Track}) {
  return Object.keys(tracks).map(trackId => (
    <TrackViewer
      track={tracks[trackId]}
      key={trackId}
    />
  ));
}
