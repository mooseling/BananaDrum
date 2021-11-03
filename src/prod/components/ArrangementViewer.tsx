import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';

export function ArrangementViewer({arrangement}:{arrangement:Arrangement}): JSX.Element {
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
