import {NoteViewer} from './NoteViewer';
import {Overlay, OverlayState} from './Overlay';
import {useState, useEffect, useContext} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';

const widthPerNote = 55.5; // 50pt for width, 2 * 2pt for padding, and 1.5pt for border 


export function TrackViewer({track}:{track:Banana.Track}): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;

  let [state, update] = useState({track, arrangement});
  const subscription = () => update({track, arrangement});
  useEffect(() => {
    track.subscribe(subscription);
    return () => track.unsubscribe(subscription);
  }, []);

  const [overlayState] = useState(OverlayState(false));

  return (
    <div className="track-viewer">
      <div className="note-line-wrapper overlay-wrapper">
        <NoteLine track={track}/>
        <Overlay state={overlayState}>
          <TrackControls track={track}/>
        </Overlay>
      </div>
      <TrackMeta track={track} toggleControls={() => overlayState.toggle()}/>
    </div>
  );
}


function TrackMeta({track, toggleControls}:{track:Banana.Track, toggleControls:() => void}): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div
      className="track-meta"
      style={{backgroundColor:track.colour}}
      >
      <button className="options-button push-button small gray" onClick={toggleControls}>
        <img src="images/icons/wrench.svg" alt="options"/>
      </button>
      {instrumentName}
    </div>
  );
}


function NoteLine({track}:{track:Banana.Track}): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  const [sixteenths, setSixteenths] = useState(arrangement.getSixteenths());

  const subscription = () => setSixteenths(arrangement.getSixteenths());
  useEffect(() => {
    arrangement.timeParams.subscribe(subscription);
    return () => arrangement.timeParams.unsubscribe(subscription);
  }, []);

  const width:string = sixteenths.length * widthPerNote + 'pt';

  return (<div className="note-line" style={{minWidth:width}}>
    {sixteenths.map(timing => track.getNoteAt(timing))
      .map(note => <NoteViewer note={note} key={note.timing}/>)}
  </div>);
}


function TrackControls({track}:{track:Banana.Track}): JSX.Element {
  return (
    <div className="track-controls">
      <button className="push-button gray" onClick={() => track.arrangement.removeTrack(track)}>Remove track</button>
    </div>
  );
}
