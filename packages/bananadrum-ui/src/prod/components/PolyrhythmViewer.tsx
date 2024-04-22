import { Polyrhythm } from "bananadrum-core";
import { NoteViewer } from "./NoteViewer";

export function PolyrhythmViewer({polyrhythm}:{polyrhythm:Polyrhythm}): JSX.Element {
  return (
    <div id={`polyrhythm-${polyrhythm.id}`} className="polyrhythm-viewer">
      {polyrhythm.notes.map(note => <NoteViewer note={note} inPolyrhythm={true} key={note.id}/>)}
    </div>
  );
}
