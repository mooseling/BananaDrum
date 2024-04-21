import { Polyrhythm } from "bananadrum-core";
import { useMemo } from "react";
import { NoteViewer } from "./NoteViewer";

export function PolyrhythmViewer({polyrhythm}:{polyrhythm:Polyrhythm}): JSX.Element {
  const colour = useMemo(() => colours[colourIndex++ % colours.length], []);

  return (
    <div id={`polyrhythm-${polyrhythm.id}`} className="polyrhythm-viewer" style={{backgroundColor:colour}}>
      {polyrhythm.notes.map(note => <NoteViewer note={note} inPolyrhythm={true} key={note.id}/>)}
    </div>
  );
}


let colourIndex = 0;

const colours = [
  'hsl(268, 61%, 69%)',
  'hsl(200, 97%, 51%)',
  'hsl(182, 63%, 34%)',
  'hsl(25, 80%, 63%)',
  'hsl(52, 100%, 70%)'
];
