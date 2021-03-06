import {useState, useContext, useEffect} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {EventEngine} from '../EventEngine';
import {isSameTiming} from '../utils';


export function NoteViewer({note}:{note:Banana.Note}): JSX.Element {
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const timingPublisher:Banana.Subscribable = arrangementPlayer.currentTimingPublisher;
  const [isCurrent, setIsCurrent] = useState(isSameTiming(arrangementPlayer.currentTiming, note.timing));
  const [playing, setPlaying] = useState(EventEngine.state === 'playing')

  const engineSubscription:Banana.Subscription = () => setPlaying(EventEngine.state === 'playing');
  useEffect(() => {
    EventEngine.subscribe(engineSubscription);
    return () => EventEngine.unsubscribe(engineSubscription);
  }, []);

  const timingSubscription:Banana.Subscription =
    () => setIsCurrent(isSameTiming(arrangementPlayer.currentTiming, note.timing));
  useEffect(() => {
    timingPublisher.subscribe(timingSubscription);
    return () => timingPublisher.unsubscribe(timingSubscription);
  }, []);

  const backgroundColor = (playing && isCurrent) ?
    'var(--light-yellow)'                 // Light up notes as the music plays
    : note.noteStyle ? note.track.colour  // Otherwise, give active notes the track colour
    : '';                                 // Inactive notes have no inline background colour

  const [noteStyle, setNoteStyle] = useState(note.noteStyle)
  const noteSubscription:Banana.Subscription = () => setNoteStyle(note.noteStyle);
  useEffect(() => {
    note.subscribe(noteSubscription);
    return () => note.unsubscribe(noteSubscription);
  }, []);

  return (
    <div
      className={getClasses(note)}
      onClick={() => cycleNoteStyle(note)}
      style={{backgroundColor}}
      data-timing={`${note.timing.bar}.${note.timing.step}`}
    >
      <div className="note-viewer-background" />
      <NoteDetailsViewer noteStyle={noteStyle} />
    </div>
  );
}


function getClasses(note:Banana.Note): string {
  let classes:string[] = ['note-viewer'];
  const {step} = note.timing;

  classes.push(getParityClass(note));

  if (step === 1)
    classes.push('start-of-bar');

  return classes.join(' ');
}


function getParityClass(note:Banana.Note): string|null {
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


function NoteDetailsViewer({noteStyle}:{noteStyle:Banana.NoteStyle}): JSX.Element {
  return (
    <div className="note-details-viewer" >
      <NoteStyleSymbolViewer noteStyle={noteStyle}/>
    </div>
  );
}


function NoteStyleSymbolViewer({noteStyle}:{noteStyle:Banana.NoteStyle}): JSX.Element {
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


function cycleNoteStyle(note:Banana.Note) {
  const noteStyle:Banana.NoteStyle|null = getNextNoteStyle(note);
  note.noteStyle = noteStyle;
}


function getNextNoteStyle(note:Banana.Note): Banana.NoteStyle {
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
