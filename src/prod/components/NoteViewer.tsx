import {useState, useContext, useEffect} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';


export function NoteViewer({note}:{note:Banana.Note}): JSX.Element {
  return (
    <div className={getClasses(note)} onClick={() => cycleNoteStyle(note)}>
      <div className="note-viewer-background"></div>
      <NoteHighlighter timing={note.timing} />
      <NoteDetailsViewer noteStyle={note.noteStyle} />
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


function NoteHighlighter({timing}:{timing:Banana.Timing}): JSX.Element {
  const player:Banana.ArrangementPlayer = useContext(ArrangementPlayerContext);
  const [currentTiming, rememberTiming] = useState(player.currentTiming);
  useEffect(() => player.subscribe(() => rememberTiming(player.currentTiming)), []);
  const litCLass = currentTiming === timing ? ' lit' : ''
  return <div className={'note-highlighter' + litCLass}></div>;
}


function NoteDetailsViewer({noteStyle}:{noteStyle:Banana.NoteStyle}): JSX.Element {
  return <div>{noteStyle ? noteStyle.noteStyleId : ''}</div>;
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
