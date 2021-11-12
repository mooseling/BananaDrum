import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {useState, useEffect} from 'react';

export function ArrangementViewer({arrangement}:{arrangement:Arrangement}): JSX.Element {
  let [state, update] = useState({arrangement});
  useEffect(() => arrangement.timeParams.subscribe(() => update({arrangement})), []);
  return (
    <div className="arrangement-viewer">
      <ArrangementControls arrangement={arrangement}/>
      {arrangement.tracks.map(track => (
        <TrackViewer
          track={track}
          key={track.instrument.instrumentId}
          arrangement={arrangement}/>
      ))}
    </div>
  );
}
