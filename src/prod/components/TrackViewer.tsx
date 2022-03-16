import {NoteViewer} from './NoteViewer';
import {Overlay, OverlayState} from './Overlay';
import {useState, useEffect} from 'react';

const widthPerNote = 55.5; // 50pt for width, 2 * 2pt for padding, and 1.5pt for border


export function TrackViewer({track}:{track:Banana.Track}): JSX.Element {
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
  const [noteCount, setNoteCount] = useState(track.notes.length);

  const subscription = () => setNoteCount(track.notes.length);
  useEffect(() => {
    track.subscribe(subscription);
    return () => track.unsubscribe(subscription);
  }, []);

  const width:string = noteCount * widthPerNote + 'pt';

  // Track.notes are not ordered (yet), so we have to use getSixteenths to order the elements correctly
  return (<div className="note-line" style={{minWidth:width}}>
    {track.notes.map(note => <NoteViewer note={note} key={getTimingString(note)}/>)}
  </div>);
}


function TrackControls({track}:{track:Banana.Track}): JSX.Element {
  return (
    <div className="track-controls">
      <button className="push-button gray" onClick={() => track.arrangement.removeTrack(track)}>Remove track</button>
    </div>
  );
}


function getTimingString(note:Banana.Note): Banana.PackedTiming {
  return `${note.timing.bar}:${note.timing.step}`;
}
