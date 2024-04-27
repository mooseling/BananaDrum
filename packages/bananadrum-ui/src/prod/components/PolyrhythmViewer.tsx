import { Polyrhythm } from "bananadrum-core";
import { useContext, useState } from "react";
import { ModeManagerContext } from "../BananaDrumUi";
import { useSubscription } from "../hooks/useSubscription";
import { NoteViewer } from "./NoteViewer";

export function PolyrhythmViewer({polyrhythm}:{polyrhythm:Polyrhythm}): JSX.Element {
  const track = polyrhythm.start.track;
  const modeManager = useContext(ModeManagerContext);

  const [deleteMode, setDeleteMode] = useState(modeManager.deletePolyrhythmMode);
  useSubscription(modeManager, () => setDeleteMode(modeManager.deletePolyrhythmMode));

  const [isShrouded, setShrouded] = useState(checkShrouded(polyrhythm));
  useSubscription(track, () => setShrouded(checkShrouded(polyrhythm)));

  return (
    <div id={`polyrhythm-${polyrhythm.id}`} className="polyrhythm-viewer">
      {
        deleteMode
        ? (
          <div className={`delete-polyrhythm-wrapper ${isShrouded ? 'shrouded' : ''}`}>
          {
            isShrouded
            ? (<></>)
            : (
              <button
                disabled={isShrouded}
                className="push-button"
                onClick={() => track.removePolyrhythm(polyrhythm)}
              >Delete</button>
            )
          }
          </div>
        )
        : polyrhythm.notes.map(note => <NoteViewer note={note} inPolyrhythm={true} key={note.id}/>)
      }
    </div>
  );
}


function checkShrouded(polyrhythm:Polyrhythm) {
  const track = polyrhythm.start.track;
  for (const otherPolyrhythm of track.polyrhythms) {
    if (otherPolyrhythm !== polyrhythm) {
      if (otherPolyrhythm.start.polyrhythm === polyrhythm || otherPolyrhythm.end.polyrhythm === polyrhythm)
        return true;
    }
  }

  return false;
}
