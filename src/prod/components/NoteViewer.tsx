export function NoteViewer({note}:{note:Note}): JSX.Element {
  const {noteStyle} = note;
  const classes = getClasses(note);
  return (
    <div className={classes} onClick={handleClick}>
      {noteStyle ? noteStyle.noteStyleId : ''}
    </div>
  );

  function handleClick() {
    cycleNoteStyle(note);
  }
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
