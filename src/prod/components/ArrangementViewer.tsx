import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {useState, useEffect, createContext} from 'react';

export const ArrangementPlayerContext = createContext(null);

export function ArrangementViewer({arrangement, arrangementPlayer}:{arrangement:Banana.Arrangement, arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  let [state, update] = useState({arrangement});
  useEffect(() => arrangement.timeParams.subscribe(() => update({arrangement})), []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
      <div className="arrangement-viewer">
        <div className="arrangement-viewer-head">
          <ArrangementControls arrangement={arrangement}/>
        </div>
        <div className="arrangement-viewer-body">
          {getTrackViewers(arrangement)}
        </div>
      </div>
    </ArrangementPlayerContext.Provider>
  );
}


function getTrackViewers(arrangement:Banana.Arrangement) {
  return arrangement.tracks.map(track => (
    <TrackViewer
      track={track}
      key={track.instrument.instrumentId}
      arrangement={arrangement}/>
  ));
}
