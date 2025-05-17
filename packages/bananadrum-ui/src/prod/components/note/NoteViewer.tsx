import { NoteView, NoteStyle, Subscribable, isSameTiming, EditCommand } from 'bananadrum-core';
import { createAudioBufferPlayer, TrackPlayer, ArrangementPlayer } from 'bananadrum-player';
import { useState, useContext, useCallback, useMemo } from 'react';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer.js';
import { ModeManagerContext, SelectionManagerContext } from '../../BananaDrumUi.js';
import { useSubscription } from '../../hooks/useSubscription.js';
import { TrackPlayerContext } from '../track/TrackViewer.js';
import { TouchHoldDetector } from '../TouchHoldDetector.js';
import { NoteStyleSymbolViewer } from './NoteStyleSymbolViewer.js';
import { useEditCommand } from '../../hooks/useEditCommand.js';
import { getTrackColour } from '../../track-colour.js';

const audioContext = new AudioContext();


export function NoteViewer({note}:{note:NoteView}): JSX.Element {
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const trackPlayer = useContext(TrackPlayerContext);
  const selectionManager = useContext(SelectionManagerContext);
  const modeManager = useContext(ModeManagerContext);
  const timingPublisher:Subscribable = note.polyrhythm
    ? trackPlayer.currentPolyrhythmNotePublisher
    : arrangementPlayer.currentTimingPublisher;
  const edit = useEditCommand();

  const [isCurrent, setIsCurrent] = useState(isCurrentlyPlaying(note, arrangementPlayer, trackPlayer));
  const [selected, setSelected] = useState(selectionManager.isSelected(note));

  useSubscription(timingPublisher, () => setIsCurrent(isCurrentlyPlaying(note, arrangementPlayer, trackPlayer)));
  useSubscription(selectionManager, () => setSelected(selectionManager.isSelected(note)));

  const [noteStyle, setNoteStyle] = useState(note.noteStyle)
  useSubscription(note, () => setNoteStyle(note.noteStyle));

  const handleClick = useCallback((event:React.MouseEvent) => {
    if (event.shiftKey || modeManager.mobileSelectionMode) {
      selectionManager.handleClick(note);
    } else if (!modeManager.selectByMouseOverMode) { // We ignore the click event at the end of a select-by-mouseover action
      if (selectionManager.selections.size) {
        selectionManager.deselectAll();
      } else {
        cycleNoteStyle(note, edit);
        selectionManager.deselectAll();
      }
    }

    event.stopPropagation();
  }, []);

  const handleMouseMove = useCallback((event:React.MouseEvent) => {
    if (
      modeManager.selectByMouseOverMode
      && event.buttons === 1 // Primary button, and no others, is held down
    ) {
      selectionManager.handleClick(note);
    }
  }, []);

  const handleMouseDown = useCallback((event:React.MouseEvent) => {
    if (!event.shiftKey && !modeManager.mobileSelectionMode)
      selectionManager.deselectAll();
  }, []);

  const handleTouchHold = useCallback(() => {
    selectionManager.handleClick(note);
    modeManager.mobileSelectionMode = true;
  }, []);


  const idString = useMemo(() => `note-${note.id}`, []);
  const classString = useClasses(note); // This is a hook because it calls useMemo
  const backgroundColor = useBackgroundColor(note, isCurrent, selected);

  return (
    <div
      id={idString}
      className={classString}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      style={{backgroundColor}}
    >
      <TouchHoldDetector
          holdLength={500}
          callback={handleTouchHold}
        >
        <div className="note-details-viewer" >
          <NoteStyleSymbolViewer noteStyle={noteStyle} />
        </div>
      </TouchHoldDetector>
    </div>
  );
}

const baseNoteClasses = 'note-viewer note-width';

function useClasses(note:NoteView): string {
  const inPolyrhythm = note.polyrhythm !== undefined;
  const {bar, step} = note.timing;
  const {timeSignature, stepResolution} = note.track.arrangement.timeParams;

  return useMemo(() => {
    if (inPolyrhythm)
      return baseNoteClasses;

    const classes:string[] = [baseNoteClasses];
    const {step} = note.timing;

    classes.push(getParityClass(bar, step, timeSignature, stepResolution));

    if (step === 1)
      classes.push('start-of-bar');

    return classes.join(' ');
  }, [inPolyrhythm, bar, step, timeSignature, stepResolution]);
}


export function getParityClass(bar:number, step:number, timeSignature:string, stepResolution:number): string|null {
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
      return (step === 1 || step === 3 || step === 5) ? 'odd-beat' : 'even-beat';
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

function useBackgroundColor(note:NoteView, isCurrent:boolean, selected:boolean) {
  const selectedColour = useMemo(() => getSelectedColour(note.track.instrument.colourGroup), []);

  // We could memoise this next calculation, but I feel like with the memo dependencies, little or nothing will be gained
  return isCurrent
    ? 'var(--light-yellow)'    // Light up notes as the music plays
    : selected
      ? selectedColour
      : note.noteStyle
          ? getTrackColour(note.track)  // Otherwise, give active notes the track colour
          : '';                         // Inactive notes have no inline background colour
}


function isCurrentlyPlaying(note:NoteView, arrangementPlayer:ArrangementPlayer, trackPlayer:TrackPlayer) {
  if (note.polyrhythm)
    return trackPlayer.currentPolyrhythmNote === note;

  if (arrangementPlayer.currentTiming === null)
    return false;

  return isSameTiming(arrangementPlayer.currentTiming, note.timing);
}


function cycleNoteStyle(note:NoteView, edit:(command:EditCommand) => void) {
  const noteStyle:NoteStyle|null = getNextNoteStyle(note);
  edit({note, noteStyle});
  if (noteStyle && noteStyle.audioBuffer) {
    createAudioBufferPlayer(noteStyle.audioBuffer, audioContext);
    audioContext.resume();
  }
}


function getNextNoteStyle(note:NoteView): NoteStyle {
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


function getSelectedColour(colourGroup:string) {
  switch (colourGroup) {
    case 'yellow': return `var(--secondary-purple)`;
    case 'orange': return `var(--secondary-blue)`;
    case 'green': return `var(--secondary-red)`;
    case 'blue': return `var(--secondary-orange)`;
    case 'purple': return `var(--secondary-green)`;
  }
}
