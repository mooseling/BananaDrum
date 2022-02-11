import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {InstrumentBrowser} from './InstrumentBrowser';
import {Overlay, OverlayState} from './Overlay';
import {EventEngine} from '../EventEngine';
import {useState, useEffect, createContext} from 'react';

export const ArrangementPlayerContext = createContext(null);

export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [tracks, setTracks] = useState({...arrangement.tracks});
  const [eventEngineState, updateEventEngineState] = useState(EventEngine.state);

  // Create Overlay-publisher on initial component creation
  const [overlayState] = useState(OverlayState(false));

  const tracksSubscription = () => setTracks({...arrangement.tracks});
  useEffect(() => {
    arrangement.subscribe(tracksSubscription);
    return () => arrangement.unsubscribe(tracksSubscription);
  }, []);

  const eventEngineSubscription = () => updateEventEngineState(EventEngine.state);
  useEffect(() => {
    EventEngine.subscribe(eventEngineSubscription);
    return () => EventEngine.unsubscribe(eventEngineSubscription);
  }, []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
      <div className="arrangement-viewer" event-engine-state={eventEngineState}>
        <div className="arrangement-viewer-head">
          <ArrangementControls />
        </div>
        <div className="arrangement-viewer-body overlay-wrapper">
          <div className="track-viewers-wrapper">
            {getTrackViewers(tracks)}
          </div>
          <button id="show-instrument-browser" onClick={() => !overlayState.visible && overlayState.toggle()}>Add Instrument</button>
          <Overlay state={overlayState}>
            <InstrumentBrowser close={() => overlayState.visible && overlayState.toggle()}/>
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
