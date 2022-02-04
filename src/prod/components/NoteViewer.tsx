import {useState, useContext, useEffect} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {EventEngine} from '../EventEngine';


// NoteViewers don't currently subscribe to note changes
// Instead, editing happens through the Track, and the whole NoteLine is refreshed
export function NoteViewer({note}:{note:Banana.Note}): JSX.Element {
  const player:Banana.ArrangementPlayer = useContext(ArrangementPlayerContext);
  const [isCurrent, setIsCurrent] = useState(player.currentTiming === note.timing);
  const [playing, setPlaying] = useState(EventEngine.state === 'playing')

  const engineSubscription:Banana.Subscription = () => setPlaying(EventEngine.state === 'playing');
  useEffect(() => {
    EventEngine.subscribe(engineSubscription);
    return () => EventEngine.unsubscribe(engineSubscription); // Unsubscribe when this element leaves the UI
  }, []);

  const timingSubscription:Banana.Subscription = () => setIsCurrent(player.currentTiming === note.timing);
  useEffect(() => {
    player.subscribe(timingSubscription);
    return () => player.unsubscribe(timingSubscription); // Unsubscribe when this element leaves the UI
  }, []);

  const backgroundColor = (playing && isCurrent) ? 'var(--light-yellow)' // Light up notes as the music plays
    : note.noteStyle ? note.track.colour                    // Otherwise, give active notes the track colour
    : '';                                                   // Inactive notes have no inline background colour

  return (
    <div
    className={getClasses(note)}
    onClick={() => cycleNoteStyle(note)}
    style={{backgroundColor}}
    >
      <div className="note-viewer-background"
      ></div>
      <NoteDetailsViewer note={note} />
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


function NoteDetailsViewer({note}:{note:Banana.Note}): JSX.Element {
  return (
    <div className="note-details-viewer" >
      <NoteStyleSymbolViewer noteStyle={note.noteStyle}/>
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
  const nextNoteStyleId: string|undefined = getNextNoteStyleId(note);
  const editCommand: Banana.EditCommand = {timing: note.timing, newValue: nextNoteStyleId || null};
  note.track.edit(editCommand);
}


function getNextNoteStyleId(note:Banana.Note): string|undefined {
  const noteStyles = note.track.instrument.noteStyles;
  const noteStyleIds = Object.keys(noteStyles);
  if (!note.noteStyle)
    return noteStyleIds[0];
  const noteStyleId = note.noteStyle.noteStyleId;
  const index = noteStyleIds.indexOf(noteStyleId);
  return noteStyleIds[index + 1]; // Out of bounds is ok, we'll handle undefined above
}
