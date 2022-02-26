import {useState, useContext, useEffect} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {EventEngine} from '../EventEngine';
import {isSameTiming} from '../utils';


// NoteViewers don't currently subscribe to note changes
// Instead, editing happens through the Track, and the whole NoteLine is refreshed
export function NoteViewer({note}:{note:Banana.Note}): JSX.Element {
  const player:Banana.ArrangementPlayer = useContext(ArrangementPlayerContext);
  const [isCurrent, setIsCurrent] = useState(isSameTiming(player.currentTiming, note.timing));
  const [playing, setPlaying] = useState(EventEngine.state === 'playing')

  const engineSubscription:Banana.Subscription = () => setPlaying(EventEngine.state === 'playing');
  useEffect(() => {
    EventEngine.subscribe(engineSubscription);
    return () => EventEngine.unsubscribe(engineSubscription); // Unsubscribe when this element leaves the UI
  }, []);

  const timingSubscription:Banana.Subscription = () => setIsCurrent(isSameTiming(player.currentTiming, note.timing));
  useEffect(() => {
    player.subscribe(timingSubscription);
    return () => player.unsubscribe(timingSubscription); // Unsubscribe when this element leaves the UI
  }, []);

  const backgroundColor = (playing && isCurrent) ? 'var(--light-yellow)' // Light up notes as the music plays
    : note.noteStyle ? note.track.colour                    // Otherwise, give active notes the track colour
    : '';                                                   // Inactive notes have no inline background colour

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
    >
      <div className="note-viewer-background" />
      <NoteDetailsViewer noteStyle={noteStyle} />
    </div>
  );
}


function getClasses(note:Banana.Note) {
  let classes:string[] = ['note-viewer'];
  const timingBits = note.timing.split('.')

  const beat = Number(timingBits[1]);
  const beatIsEven = beat % 2 === 0;
  classes.push(beatIsEven ? 'even-beat' : 'odd-beat');

  if (beat === 1 && timingBits[2] === '1' && timingBits[2] === '1' && !timingBits[3])
    classes.push('start-of-bar');

  return classes.join(' ');
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
  if (noteStyle.symbol) {
    if (noteStyle.symbol.src)
      return <img className="note-style-symbol" src={noteStyle.symbol.src} alt={noteStyle.noteStyleId}/>;
    if (noteStyle.symbol.string)
      return <span className="note-style-symbol">noteStyle.symbol.string</span>;
  }
  return <span className="note-style-symbol">noteStyle.noteStyleId</span>;
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
  const currentNoteStyleId = note.noteStyle.noteStyleId;
  const index = noteStyleIds.indexOf(currentNoteStyleId);
  const nextNoteStyleId = noteStyleIds[index + 1];
  if (nextNoteStyleId)
    return noteStyles[nextNoteStyleId];
  return null; // Cycle back to rest after all note-styles
}
