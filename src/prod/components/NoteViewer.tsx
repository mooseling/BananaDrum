export function NoteViewer({note}:{note:Note}): JSX.Element {
  const {noteStyle} = note;
  return (<div className="note-viewer">
    {noteStyle ? noteStyle.noteStyleId : ''}
  </div>);
}
