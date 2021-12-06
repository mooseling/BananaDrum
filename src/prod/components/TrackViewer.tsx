import {NoteViewer} from './NoteViewer';
import {useState, useEffect} from 'react';


export function TrackViewer({track, arrangement}:{track:Banana.Track, arrangement:Banana.Arrangement}): JSX.Element {
  let [state, update] = useState({track, arrangement});
  useEffect(() => track.subscribe(() => update({track, arrangement})), []);
  return (
    <div className="track-viewer">
      <TrackMeta track={track}/>
      <NoteLine track={track} arrangement={arrangement}/>
    </div>
  );
}


function TrackMeta({track}:{track:Banana.Track}): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div className="track-meta">
      {instrumentName}
    </div>
  );
}


function NoteLine({track, arrangement}:{track:Banana.Track, arrangement:Banana.Arrangement}): JSX.Element {
  const sixteenths:Banana.Timing[] = arrangement.getSixteenths();
  return (<div className="note-line">
    {sixteenths.map(timing => track.getNoteAt(timing))
      .map(note => <NoteViewer note={note} key={note.timing}/>)}
  </div>);
}
