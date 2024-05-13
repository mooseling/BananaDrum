import { NoteStyle } from "bananadrum-core";
import { NoteStyleSymbolViewer } from "./NoteStyleSymbolViewer";

export function NoteDetailsViewer({noteStyle}:{noteStyle:NoteStyle}): JSX.Element {
  return (
    <div className="note-details-viewer" >
      <NoteStyleSymbolViewer noteStyle={noteStyle}/>
    </div>
  );
}
