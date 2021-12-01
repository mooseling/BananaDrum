import {useState, useContext, useEffect, memo} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';


const MemoNoteDetailsViewer = memo(NoteDetailsViewer);


export function NoteViewer({note}:{note:Note}): JSX.Element {
  return (
    <div className={getClasses(note)} onClick={() => cycleNoteStyle(note)}>
      <NoteHighlighter timing={note.timing}>
        <MemoNoteDetailsViewer noteStyle={note.noteStyle} />
      </NoteHighlighter>
    </div>
  );
}


function getClasses(note:Note) {
  let classes:string[] = ['note-viewer'];
  const timingBits = note.timing.split('.')

  const beat = Number(timingBits[1]);
  const beatIsEven = beat % 2 === 0;
  classes.push(beatIsEven ? 'even-beat' : 'odd-beat');

  if (beat === 1 && timingBits[2] === '1' && timingBits[2] === '1' && !timingBits[3])
    classes.push('start-of-bar');

  return classes.join(' ');
}


function NoteHighlighter({timing, children}:{timing:Timing, children:JSX.Element}): JSX.Element {
  const player:ArrangementPlayer = useContext(ArrangementPlayerContext);
  const [currentTiming, rememberTiming] = useState(player.currentTiming);
  useEffect(() => player.subscribe(() => rememberTiming(player.currentTiming)), []);
  return (
    <div className={'note-highlighter' + (currentTiming === timing ? ' lit' : '')}>
      {children}
    </div>
  );
}


function NoteDetailsViewer({noteStyle}:{noteStyle:NoteStyle}): JSX.Element {
  return <div>{noteStyle ? noteStyle.noteStyleId : ''}</div>;
}


function cycleNoteStyle(note:Note) {
  const nextNoteStyleId: string|undefined = getNextNoteStyleId(note);
  const editCommand: EditCommand = {timing: note.timing, newValue: nextNoteStyleId || null};
  note.track.edit(editCommand);
}


function getNextNoteStyleId(note:Note): string|undefined {
  const noteStyles = note.track.instrument.noteStyles;
  const noteStyleIds = Object.keys(noteStyles);
  if (!note.noteStyle)
    return noteStyleIds[0];
  const noteStyleId = note.noteStyle.noteStyleId;
  const index = noteStyleIds.indexOf(noteStyleId);
  return noteStyleIds[index + 1]; // Out of bounds is ok, we'll handle undefined above
}
