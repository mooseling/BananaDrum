import { Note, NoteStyle, Subscribable, isSameTiming } from 'bananadrum-core';
import { getEventEngine, createAudioBufferPlayer, TrackPlayer, ArrangementPlayer } from 'bananadrum-player';
import { useState, useContext } from 'react';
import { ArrangementPlayerContext } from './arrangement/ArrangementViewer.js';
import { SelectionManagerContext } from '../BananaDrumUi.js';
import { useSubscription } from '../hooks/useSubscription.js';
import { TrackPlayerContext } from './TrackViewer.js';

const audioContext = new AudioContext();
const eventEngine = getEventEngine();


export function NoteViewer({note, inPolyrhythm}:{note:Note, inPolyrhythm?:boolean}): JSX.Element {
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const trackPlayer = useContext(TrackPlayerContext);
  const selectionManager = useContext(SelectionManagerContext);
  const timingPublisher:Subscribable = note.polyrhythm
    ? trackPlayer.currentPolyrhythmNotePublisher
    : arrangementPlayer.currentTimingPublisher;

  const [isCurrent, setIsCurrent] = useState(isCurrentlyPlaying(note, arrangementPlayer, trackPlayer));
  const [playing, setPlaying] = useState(eventEngine.state === 'playing')
  const [selected, setSelected] = useState(selectionManager.isSelected(note));

  useSubscription(eventEngine, () => {
    if (eventEngine.state === 'playing'){
      setPlaying(true);
    } else {
      setPlaying(false);
      setIsCurrent(false);
    }
  });

  useSubscription(timingPublisher, () => setIsCurrent(isCurrentlyPlaying(note, arrangementPlayer, trackPlayer)));
  useSubscription(selectionManager, () => setSelected(selectionManager.isSelected(note)));

  const backgroundColor = (playing && isCurrent) ?
    'var(--light-yellow)'      // Light up notes as the music plays
    : selected ?
      `var(--selected-${note.track.instrument.colourGroup})` :
        note.noteStyle
          ? note.track.colour  // Otherwise, give active notes the track colour
          : '';                // Inactive notes have no inline background colour

  const [noteStyle, setNoteStyle] = useState(note.noteStyle)
  useSubscription(note, () => setNoteStyle(note.noteStyle));

  const handleClick = (event:React.MouseEvent) => {
    if (event.shiftKey) {
      selectionManager.handleClick(note);
    } else {
      cycleNoteStyle(note);
      selectionManager.deselectAll();
    }

    event.stopPropagation();
  }

  return (
    <div
      id={`note-${note.id}`}
      className={inPolyrhythm ? 'note-viewer' : getClasses(note)}
      onClick={handleClick}
      style={{backgroundColor}}
      data-timing={`${note.timing.bar}.${note.timing.step}`}
    >
      <div className="note-viewer-background" />
      <NoteDetailsViewer noteStyle={noteStyle} />
    </div>
  );
}


function getClasses(note:Note): string {
  const classes:string[] = ['note-viewer'];
  const {step} = note.timing;

  classes.push(getParityClass(note));

  if (step === 1)
    classes.push('start-of-bar');

  return classes.join(' ');
}


function getParityClass(note:Note): string|null {
  const {timeSignature, stepResolution} = note.track.arrangement.timeParams;
  const {bar, step} = note.timing;

    if (timeSignature === '4/4' && stepResolution === 16) {
      const beat = Math.floor((step - 1) / 4) + 1;
      const beatIsEven = beat % 2 === 0;
      return beatIsEven ? 'even-beat' : 'odd-beat';
    }
    if (timeSignature === '6/8' && stepResolution === 8) {
      const beat = Math.floor((step - 1) / 3) + 1;
      const beatIsEven = beat % 2 === 0;
      return beatIsEven ? 'even-beat' : 'odd-beat';
    }
    if (timeSignature === '5/4' && stepResolution === 8) {
      const beat = Math.floor((step - 1) / 2) + 1;
      let beatIsEven = beat % 2 === 0;
      if (bar % 2 === 0)
        beatIsEven = !beatIsEven; // 5 groups in each bar, so swap every bar
      return beatIsEven ? 'even-beat' : 'odd-beat';
    }
    if (timeSignature === '7/8' && stepResolution === 8) {
      return (bar % 2) ? 'even-beat' : 'odd-beat';
    }
    const [beatsPerBar, beatUnit] = timeSignature.split('/').map(str => Number(str));
    const stepsPerBeat = stepResolution / beatUnit;
    if (stepsPerBeat > 1) {
      const beat = Math.floor((step - 1) / stepsPerBeat) + 1;
      let beatIsEven = beat % 2 === 0;
      if (beatsPerBar % 2 === 1 && bar % 2 === 0)
        beatIsEven = !beatIsEven; // odd number of groups in each bar, so swap every bar
      return beatIsEven ? 'even-beat' : 'odd-beat';
    }
    // If all else fails, we just alternate each note
    const stepsPerBar = stepsPerBeat * beatsPerBar;
    const stepIsEven = ((bar - 1) * stepsPerBar + step - 1) % 2 === 0;
    return stepIsEven ? 'even-beat' : 'odd-beat';
}


function isCurrentlyPlaying(note:Note, arrangementPlayer:ArrangementPlayer, trackPlayer:TrackPlayer) {
  if (note.polyrhythm)
    return trackPlayer.currentPolyrhythmNote === note;
  return isSameTiming(arrangementPlayer.currentTiming, note.timing);
}


function NoteDetailsViewer({noteStyle}:{noteStyle:NoteStyle}): JSX.Element {
  return (
    <div className="note-details-viewer" >
      <NoteStyleSymbolViewer noteStyle={noteStyle}/>
    </div>
  );
}


function NoteStyleSymbolViewer({noteStyle}:{noteStyle:NoteStyle}): JSX.Element {
  if (!noteStyle)
    return null;
  const {symbol} = noteStyle;
  if (symbol) {
    if (symbol.src)
      return <img className="note-style-symbol" src={symbol.src} alt={symbol.string}/>;
    if (symbol.string)
      return <span className="note-style-symbol">{symbol.string}</span>;
  }
  return <span className="note-style-symbol">{noteStyle.id}</span>;
}


function cycleNoteStyle(note:Note) {
  const noteStyle:NoteStyle|null = getNextNoteStyle(note);
  note.noteStyle = noteStyle;
  if (noteStyle && noteStyle.audioBuffer) {
    createAudioBufferPlayer(noteStyle.audioBuffer, audioContext);
    audioContext.resume();
  }
}


function getNextNoteStyle(note:Note): NoteStyle {
  const noteStyles = note.track.instrument.noteStyles;
  const noteStyleIds = Object.keys(noteStyles);
  if (!note.noteStyle) // This happens when the note-style is null, meaning a rest
    return noteStyles[noteStyleIds[0]];
  const currentNoteStyleId = note.noteStyle.id;
  const index = noteStyleIds.indexOf(currentNoteStyleId);
  const nextNoteStyleId = noteStyleIds[index + 1];
  if (nextNoteStyleId)
    return noteStyles[nextNoteStyleId];
  return null; // Cycle back to rest after all note-styles
}
