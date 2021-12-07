import {NoteViewer} from './NoteViewer';
import {useState, useEffect, useContext} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';


export function TrackViewer({track}:{track:Banana.Track}): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;

  let [state, update] = useState({track, arrangement});
  useEffect(() => track.subscribe(() => update({track, arrangement})), []);

  return (
    <div className="track-viewer">
      <TrackMeta track={track}/>
      <NoteLine track={track}/>
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


function NoteLine({track}:{track:Banana.Track}): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  const [sixteenths, setSixteenths] = useState(arrangement.getSixteenths());
  useEffect(() => arrangement.timeParams.subscribe(() => setSixteenths(arrangement.getSixteenths())), []);
  return (<div className="note-line">
    {sixteenths.map(timing => track.getNoteAt(timing))
      .map(note => <NoteViewer note={note} key={note.timing}/>)}
  </div>);
}
