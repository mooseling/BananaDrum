import { PolyrhythmView } from "bananadrum-core";
import { useContext, useState } from "react";
import { ModeManagerContext } from "../components/BananaDrumViewer.js";
import { useSubscription } from "../hooks/useSubscription";
import { NoteViewer } from "./note/NoteViewer";
import { useEditCommand } from '../hooks/useEditCommand';

export function PolyrhythmViewer({polyrhythm}:{polyrhythm:PolyrhythmView}): JSX.Element {
  const track = polyrhythm.start.track;
  const modeManager = useContext(ModeManagerContext);
  const edit = useEditCommand();

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
                onClick={() => edit({track, removePolyrhythm:polyrhythm})}
              >Delete</button>
            )
          }
          </div>
        )
        : (<>
          <div className="polyrhythm-decoration" ></div>
          <div className="polyrhythm-notes-wrapper">
            {polyrhythm.notes.map(note => <NoteViewer note={note} key={note.id}/>)}
          </div>
        </>)
      }
    </div>
  );
}


function checkShrouded(polyrhythm:PolyrhythmView) {
  const track = polyrhythm.start.track;
  for (const otherPolyrhythm of track.polyrhythms) {
    if (otherPolyrhythm !== polyrhythm) {
      if (otherPolyrhythm.start.polyrhythm === polyrhythm || otherPolyrhythm.end.polyrhythm === polyrhythm)
        return true;
    }
  }

  return false;
}
