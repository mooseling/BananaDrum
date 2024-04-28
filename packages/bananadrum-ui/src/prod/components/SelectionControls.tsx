import { useContext, useRef, useState } from "react";
import { SelectionManagerContext } from "../BananaDrumUi";
import { useSubscription } from "../hooks/useSubscription";
import { SelectionManager } from "../SelectionManager";
import { ExpandingSpacer } from "./ExpandingSpacer";
import { OverlayStateContext } from "./Overlay";



export function SelectionControls(): JSX.Element {
  const selectionManager = useContext(SelectionManagerContext);
  const overlayState = useContext(OverlayStateContext);
  const polyrhythmInputRef = useRef(null);

  const [addingPolyrhythm, setAddingPolyrhythm] = useState(false);

  useSubscription(overlayState, () => {
    if (!overlayState.visible)
      setAddingPolyrhythm(false);
  })

  return (
    <div style={{display:'flex', alignItems:'center'}}>
      {
        addingPolyrhythm
        ? (<>
          <div className="time-control">
            New number of notes: <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyPress={event => {
              if (event.key === 'Enter')
                createPolyrhythm((event.target as HTMLInputElement).value, selectionManager);
            }}
            ref={polyrhythmInputRef}
            />
          </div>
          <button
            className="push-button"
            onClick={() => createPolyrhythm((polyrhythmInputRef.current as HTMLInputElement)?.value, selectionManager)}
          >go!</button>
          <ExpandingSpacer />
          <button
            className="push-button"
            onClick={() => setAddingPolyrhythm(false)}
          >Cancel</button>
        </>)
        : (<>
          <button
            className="push-button"
            onClick={() => setAddingPolyrhythm(true)}
          >add polyrhythm</button>
          <ExpandingSpacer />
        </>)
      }
    </div>
  );
}


const createPolyrhythm = (inputValue:string, selectionManager:SelectionManager) => {
  const polyrhythmLength = Number(inputValue);
  if (!polyrhythmLength)
    return;

  const start = selectionManager.getFirst();
  const end = selectionManager.getLast();
  const track = start.track;

  track.addPolyrhythm(start, end, polyrhythmLength);
  selectionManager.clearSelection();
}
