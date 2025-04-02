import { useState, createContext, useContext, TouchEvent, useLayoutEffect, useRef } from 'react';
import { PolyrhythmView, TrackView } from 'bananadrum-core';
import { NoteViewer } from './note/NoteViewer.js';
import { Overlay, toggleOverlay } from './Overlay.js';
import { ArrangementPlayerContext, NoteWidthContext, NoteLineMinWidth } from './arrangement/ArrangementViewer.js';
import { TrackPlayer } from 'bananadrum-player';
import { useSubscription } from '../hooks/useSubscription.js';
import { PolyrhythmViewer } from './PolyrhythmViewer.js';
import { useEditCommand } from '../hooks/useEditCommand.js';


type TrackViewerCallbacks = {
  noteLineTouchStart: (event:TouchEvent) => void
  noteLineTouchMove: (event:TouchEvent) => void
  noteLineTouchEnd: () => void
}


export const TrackPlayerContext = createContext<TrackPlayer>(null);

const smButtonClasses = 'options-button push-button small solo-mute-button';


export function TrackViewer({trackPlayer, callbacks}:{trackPlayer:TrackPlayer, callbacks:TrackViewerCallbacks}): JSX.Element {
  const track = trackPlayer.track;
  const overlayName = 'track_overlay_' + track.id;

  const [loaded, setLoaded] = useState(track.instrument.loaded);
  useSubscription(track.instrument, () => setLoaded(track.instrument.loaded));

  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const {audibleTrackPlayers, audibleTrackPlayersPublisher} = arrangementPlayer;
  const [audible, setAudible] = useState(!!audibleTrackPlayers.get(track));
  useSubscription(audibleTrackPlayersPublisher, () => setAudible(!!audibleTrackPlayers.get(track)));

  if (!loaded)
    return PendingTrackViewer();

  return (
    <TrackPlayerContext.Provider value={trackPlayer}>
      <div className={`track-viewer ${audible ? 'audible' : 'inaudible'}`} data-colour-group={track.instrument.colourGroup}>
        <div className="note-line-wrapper overlay-wrapper">
          <NoteLine track={track} callbacks={callbacks}/>
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
  : {track:TrackView, toggleControls:() => void}
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

  useSubscription(trackPlayer, () => {
    setSoloed(trackPlayer.soloMute === 'solo');
    setMuted(trackPlayer.soloMute === 'mute');
  })

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


function NoteLine({track, callbacks}:{track:TrackView, callbacks:TrackViewerCallbacks}): JSX.Element {
  const noteLineRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState([...track.notes]);
  const [polyrhythms, setPolyrhythms] = useState([...track.polyrhythms]);

  useSubscription(track, () => {
    setNotes([...track.notes]);
    setPolyrhythms([...track.polyrhythms]);
  });

  const minWidth = useContext(NoteLineMinWidth);

  // Polyrhythms need to reposition dynamically
  useLayoutEffect(() => {
    if (!noteLineRef)
      return;

    // Adjust polyrhythms in order, since nested polyrhythms will be repositioned based on earlier polyrhythms
    polyrhythms.forEach(polyrhythm => {
      const polyrhythmViewer = noteLineRef.current.querySelector(`#polyrhythm-${polyrhythm.id}`) as HTMLDivElement;
      repositionPolyrhythmViewer(polyrhythm, polyrhythmViewer);
    });
  }, [polyrhythms.length, useContext(NoteWidthContext)]);

  return (
    <div className="note-line" ref={noteLineRef} style={{minWidth:minWidth}} onTouchStart={callbacks.noteLineTouchStart} onTouchMove={callbacks.noteLineTouchMove} onTouchEnd={callbacks.noteLineTouchEnd}>
      <div className="polyrhythms-wrapper">
        {polyrhythms.map(polyrhythm => <PolyrhythmViewer polyrhythm={polyrhythm} key={polyrhythm.id} />)}
      </div>
      <div className="notes-wrapper">
        {notes.map(note => <NoteViewer note={note} key={note.id}/>)}
      </div>
    </div>
  );
}


function repositionPolyrhythmViewer(polyrhythm:PolyrhythmView, polyrhythmViewer:HTMLDivElement) {
  const startNoteViewer = document.getElementById(`note-${polyrhythm.start.id}`);
  const endNoteViewer = document.getElementById(`note-${polyrhythm.end.id}`);

  if (!startNoteViewer || !endNoteViewer)
    return;

  let startLeft = startNoteViewer.offsetLeft;
  if (polyrhythm.start.polyrhythm) // Start note is inside a polyrhythm, so the offset is likely only part of the picture
    startLeft += (startNoteViewer.closest('.polyrhythm-viewer') as HTMLElement).offsetLeft;

  let endLeft = endNoteViewer.offsetLeft + endNoteViewer.offsetWidth;
  if (polyrhythm.end.polyrhythm)
    endLeft += (endNoteViewer.closest('.polyrhythm-viewer') as HTMLElement).offsetLeft;

  polyrhythmViewer.style.left = `${startLeft}px`;
  polyrhythmViewer.style.width = `calc(${endLeft - startLeft}px - var(--thick-border-width)`;
}


function TrackControls(
  {track, overlayName}:{track:TrackView, overlayName:string}): JSX.Element {
    const arrangement = track.arrangement;
    const edit = useEditCommand();

  return (
    <div className="track-controls">
      <button className="push-button gray"
        onClick={() => edit({arrangement, removeTrack:track})}
      >Remove track</button>
      <button className="push-button gray"
        onClick={() => {
          edit({track, command:'clear'})
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
