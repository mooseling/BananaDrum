import {NoteViewer} from './NoteViewer';
import {Overlay, OverlayState} from './Overlay';
import {useState, useEffect, createContext, useContext} from 'react';


export const TrackPlayerContext = createContext(null);

const widthPerNote = 55.5; // 50pt for width, 2 * 2pt for padding, and 1.5pt for border


export function TrackViewer({trackPlayer}:{trackPlayer:Banana.TrackPlayer}): JSX.Element {
  const track = trackPlayer.track;
  const [overlayState] = useState(OverlayState(false));

  const [loaded, setLoaded] = useState(track.instrument.loaded);
  const instrumentSubscripion = () => setLoaded(track.instrument.loaded);
  useEffect(() => {
    track.instrument.subscribe(instrumentSubscripion);
    return () => track.instrument.unsubscribe(instrumentSubscripion);
  }, []);

  if (!loaded)
    return PendingTrackViewer();

  return (
    <TrackPlayerContext.Provider value={trackPlayer}>
      <div className="track-viewer">
        <div className="note-line-wrapper overlay-wrapper">
          <NoteLine track={track}/>
          <Overlay state={overlayState}>
            <TrackControls track={track}/>
          </Overlay>
        </div>
        <div className="scrollshadow left-scrollshadow" />
        <div className="scrollshadow right-scrollshadow" />
        <TrackMeta track={track} toggleControls={() => overlayState.toggle()}/>
      </div>
    </TrackPlayerContext.Provider>
  );
}


function TrackMeta({track, toggleControls}
  : {track:Banana.Track, toggleControls:() => void}
): JSX.Element {
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
  const [notes, setNotes] = useState([...track.notes]);

  const subscription = () => setNotes([...track.notes]);
  useEffect(() => {
    track.subscribe(subscription);
    return () => track.unsubscribe(subscription);
  }, []);

  const width:string = track.notes.length * widthPerNote + 'pt';

  return (
    <div className="note-line" style={{minWidth:width}}>
      {track.notes.map(note => <NoteViewer note={note} key={note.id}/>)}
    </div>
  );
}


function TrackControls({track}:{track:Banana.Track}): JSX.Element {
  return (
    <div className="track-controls">
      <button className="push-button gray" onClick={() => track.arrangement.removeTrack(track)}>Remove track</button>
    </div>
  );
}


function PendingTrackViewer(): JSX.Element {
  return (
    <div className="track-viewer pending-track">
      <div className="track-meta">Loading...</div>
      <div className="pending-note-line" />
    </div>
  );
}
