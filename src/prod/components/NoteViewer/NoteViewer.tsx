import React from 'react'
import './note-viewer.css'

export function NoteViewer({note}:{note:Note}): JSX.Element {
  const {noteStyle} = note;
  return (<div className="note-viewer" onClick={handleClick}>
    {noteStyle ? noteStyle.noteStyleId : ''}
  </div>);

  function handleClick() {
    cycleNoteStyle(note);
  }
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
