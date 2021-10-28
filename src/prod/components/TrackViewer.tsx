import {NoteViewer} from './NoteViewer';


export function TrackViewer({track, arrangement}:{track:Track, arrangement:Arrangement}): JSX.Element {
  return (
    <div className="track-viewer">
      <TrackMeta track={track}/>
      <NoteLine track={track} arrangement={arrangement}/>
    </div>
  );
}


function TrackMeta({track}:{track:Track}): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div className="track-meta">
      {instrumentName}
    </div>
  );
}


function NoteLine({track, arrangement}:{track:Track, arrangement:Arrangement}): JSX.Element {
  const sixteenths:Timing[] = arrangement.getSixteenths();
  return (<div className="note-line">
    {sixteenths.map(timing => track.getNoteAt(timing))
      .map(note => <NoteViewer note={note} key={note.timing}/>)}
  </div>);
}
