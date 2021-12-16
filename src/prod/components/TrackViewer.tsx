import {NoteViewer} from './NoteViewer';
import {Overlay} from './Overlay';
import {useState, useEffect, useContext} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';


export function TrackViewer({track}:{track:Banana.Track}): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;

  let [state, update] = useState({track, arrangement});
  useEffect(() => track.subscribe(() => update({track, arrangement})), []);

  const [controlsVisible, toggleControls] = useState(false);

  return (
    <div className="track-viewer">
      <TrackMeta track={track} toggleControls={() => toggleControls(!controlsVisible)}/>
      <div className="overlay-wrapper">
        <NoteLine track={track}/>
        <Overlay visible={controlsVisible}>
          <TrackControls track={track}/>
        </Overlay>
      </div>
    </div>
  );
}


function TrackMeta({track, toggleControls}:{track:Banana.Track, toggleControls:() => void}): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div className="track-meta">
      {instrumentName}<br/>
      <button onClick={toggleControls}>options</button>
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


function TrackControls({track}:{track:Banana.Track}): JSX.Element {
  return (
    <button onClick={() => track.arrangement.removeTrack(track)}>Remove track</button>
  );
}
