import { Polyrhythm } from "bananadrum-core";
import { useContext, useState } from "react";
import { ModeManagerContext } from "../BananaDrumUi";
import { useSubscription } from "../hooks/useSubscription";
import { NoteViewer } from "./NoteViewer";

export function PolyrhythmViewer({polyrhythm}:{polyrhythm:Polyrhythm}): JSX.Element {
  const modeManager = useContext(ModeManagerContext);
  const [deleteMode, setDeleteMode] = useState(modeManager.deletePolyrhythmMode);

  useSubscription(modeManager, () => setDeleteMode(modeManager.deletePolyrhythmMode));

  return (
    <div id={`polyrhythm-${polyrhythm.id}`} className="polyrhythm-viewer">
      {
        deleteMode
        ? (
          <div className="delete-polyrhythm-wrapper">
            <button
              className="push-button"
              onClick={() => polyrhythm.start.track.removePolyrhythm(polyrhythm)}
            >Delete</button>
          </div>
        )
        : polyrhythm.notes.map(note => <NoteViewer note={note} inPolyrhythm={true} key={note.id}/>)
      }
    </div>
  );
}
