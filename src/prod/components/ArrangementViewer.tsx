import {TrackViewer} from './TrackViewer';

export function ArrangementViewer({arrangement}:{arrangement:Arrangement}): JSX.Element {
  return (
    <div className="arrangement-viewer">
      {arrangement.tracks.map(track => <TrackViewer track={track}/>)}
    </div>
  );
}
