import {useState, useEffect, createContext, useContext} from 'react';
import { Track, TrackPlayer } from '../types.js';
import {NoteViewer} from './NoteViewer.jsx';
import {Overlay, toggleOverlay} from './Overlay.jsx';
import {ArrangementPlayerContext} from './ArrangementViewer.jsx';


export const TrackPlayerContext = createContext(null);

const widthPerNote = 55.5; // 50pt for width, 2 * 2pt for padding, and 1.5pt for border
const smButtonClasses = 'options-button push-button small solo-mute-button';


export function TrackViewer({trackPlayer}:{trackPlayer:TrackPlayer}): JSX.Element {
  const track = trackPlayer.track;
  const overlayName = 'track_overlay_' + track.id;

  const [loaded, setLoaded] = useState(track.instrument.loaded);
  const instrumentSubscripion = () => setLoaded(track.instrument.loaded);
  useEffect(() => {
    track.instrument.subscribe(instrumentSubscripion);
    return () => track.instrument.unsubscribe(instrumentSubscripion);
  }, []);

  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const {audibleTrackPlayers, audibleTrackPlayersPublisher} = arrangementPlayer;
  const [audible, setAudible] = useState(!!audibleTrackPlayers[track.id]);
  const arrangementPlayerSubscription = () => setAudible(!!audibleTrackPlayers[track.id]);
  useEffect(() => {
    audibleTrackPlayersPublisher.subscribe(arrangementPlayerSubscription);
    return () => audibleTrackPlayersPublisher.unsubscribe(arrangementPlayerSubscription);
  }, []);

  if (!loaded)
    return PendingTrackViewer();

  return (
    <TrackPlayerContext.Provider value={trackPlayer}>
      <div className={`track-viewer ${audible ? 'audible' : 'inaudible'}`}>
        <div className="note-line-wrapper overlay-wrapper">
          <NoteLine track={track}/>
          <Overlay name={overlayName}>
            <TrackControls track={track} overlayName={overlayName}/>
          </Overlay>
        </div>
        <div className="scrollshadow left-scrollshadow" />
        <div className="scrollshadow right-scrollshadow" />
        <TrackMeta track={track} toggleControls={() => toggleOverlay(overlayName)}/>
      </div>
    </TrackPlayerContext.Provider>
  );
}


function TrackMeta({track, toggleControls}
  : {track:Track, toggleControls:() => void}
): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div
      className="track-meta"
      style={{backgroundColor:track.colour}}
    >
      {instrumentName}
      <div className="buttons-wrapper">
        <SoloMuteButtons />
        <button className="options-button push-button small gray" onClick={toggleControls}>
          <img src="images/icons/wrench.svg" alt="options"/>
        </button>
      </div>
    </div>
  );
}


function SoloMuteButtons(): JSX.Element {
  const trackPlayer = useContext(TrackPlayerContext);
  const [soloed, setSoloed] = useState(trackPlayer.soloMute === 'solo');
  const [muted, setMuted] = useState(trackPlayer.soloMute === 'mute');

  const trackPlayerSubscription = () => {
    setSoloed(trackPlayer.soloMute === 'solo');
    setMuted(trackPlayer.soloMute === 'mute');
  };
  useEffect(() => {
    trackPlayer.subscribe(trackPlayerSubscription);
    return () => trackPlayer.unsubscribe(trackPlayerSubscription);
  }, []);

  const solo = () => trackPlayer.soloMute = (trackPlayer.soloMute === 'solo' ? null : 'solo');
  const mute = () => trackPlayer.soloMute = (trackPlayer.soloMute === 'mute' ? null : 'mute');
  const soloButtonColour = soloed ? 'lighter-green' : 'gray';
  const muteButtonColour = muted ? 'dark-blue' : 'gray';


  return (
    <>
      <button className={`${smButtonClasses} ${soloButtonColour}`} onClick={solo}>
        S
      </button>
      <button className={`${smButtonClasses} ${muteButtonColour}`} onClick={mute}>
        M
      </button>
    </>
  );
}


function NoteLine({track}:{track:Track}): JSX.Element {
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


function TrackControls(
  {track, overlayName}:{track:Track, overlayName:string}): JSX.Element {
  return (
    <div className="track-controls">
      <button className="push-button gray"
        onClick={() => track.arrangement.removeTrack(track)}
      >Remove track</button>
      <button className="push-button gray"
        onClick={() => {
          track.clear();
          toggleOverlay(overlayName, 'hide');
        }}
      >Clear track</button>
      <button className="push-button gray"
        onClick={() => toggleOverlay(overlayName, 'hide')}
      >Cancel</button>
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