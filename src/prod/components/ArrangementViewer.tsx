import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {useState, useEffect, createContext} from 'react';

export const ArrangementPlayerContext = createContext(null);

export function ArrangementViewer({arrangement, arrangementPlayer}:{arrangement:Banana.Arrangement, arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
      <div className="arrangement-viewer">
        <div className="arrangement-viewer-head">
          <ArrangementControls/>
        </div>
        <div className="arrangement-viewer-body">
          {getTrackViewers(arrangement)}
        </div>
      </div>
    </ArrangementPlayerContext.Provider>
  );
}


function getTrackViewers(arrangement:Banana.Arrangement) {
  return Object.keys(arrangement.tracks).map(trackId => (
    <TrackViewer
      track={arrangement.tracks[trackId]}
      key={trackId}
    />
  ));
}
