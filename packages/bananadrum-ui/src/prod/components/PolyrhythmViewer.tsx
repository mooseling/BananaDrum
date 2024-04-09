import { Polyrhythm } from "bananadrum-core";
import { MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { useSubscription } from "../hooks/useSubscription";
import { TrackWidthPublisherContext } from "./ArrangementViewer";
import { NoteViewer } from "./NoteViewer";

export function PolyrhythmViewer({polyrhythm}:{polyrhythm:Polyrhythm}): JSX.Element {
  const divRef: MutableRefObject<HTMLDivElement> = useRef<HTMLDivElement>();
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);

  const trackWidthPublisher = useContext(TrackWidthPublisherContext);

  const updatePositioning = () => {
    const startNoteViewer = document.getElementById(`note-${polyrhythm.start.id}`);
    const endNoteViewer = document.getElementById(`note-${polyrhythm.end.id}`);

    const startLeft = startNoteViewer.offsetLeft;
    const endLeft = endNoteViewer.offsetLeft + endNoteViewer.offsetWidth;

    setLeft(startLeft);
    setWidth(endLeft - startLeft);
  };

  useEffect(() => {
    setTimeout(updatePositioning, 0);
    const resizeObserver = new ResizeObserver(updatePositioning);
    resizeObserver.observe(divRef.current.closest('.track-viewers-wrapper'));
    return () => resizeObserver.disconnect();
  }, []);

  useSubscription(trackWidthPublisher, updatePositioning);

  const calcedWidth = `calc(${width}px - var(--thick-border-width)`;

  return (
    <div className="polyrhythm-viewer" ref={divRef} style={{left, width:calcedWidth}}>
      {polyrhythm.notes.map(note => <NoteViewer note={note} inPolyrhythm={true} key={note.id}/>)}
    </div>
  );
}
