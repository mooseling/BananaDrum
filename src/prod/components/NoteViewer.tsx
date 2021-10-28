export function NoteViewer({note}:{note:Note|null}): JSX.Element {
  return (<div className="note-viewer">
    {note ? note.noteStyle.noteStyleId : ''}
  </div>);
}
