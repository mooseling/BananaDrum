import { useContext, useEffect, useRef, useState } from "react";
import { SelectionManagerContext } from "../BananaDrumUi";
import { useKeyboardEvent } from "../hooks/useKeyboardEvent";
import { useSubscription } from "../hooks/useSubscription";
import { SelectionManager } from "../SelectionManager";
import { ExpandingSpacer } from "./ExpandingSpacer";
import { OverlayStateContext } from "./Overlay";



const digitMatcher = /^\d$/;


export function SelectionControls(): JSX.Element {
  const selectionManager = useContext(SelectionManagerContext);
  const overlayState = useContext(OverlayStateContext);
  const polyrhythmInputRef = useRef<HTMLInputElement>(null);

  const [addingPolyrhythm, setAddingPolyrhythm] = useState(false);

  useSubscription(overlayState, () => {
    if (!overlayState.visible) {
      setAddingPolyrhythm(false);
      polyrhythmInputRef.current.value = '';
    }
  });

  useKeyboardEvent(window, 'keypress', event => {
    if (selectionManager.selectedNotes.length && polyrhythmInputRef.current && digitMatcher.test(event.key)) {
      polyrhythmInputRef.current.value = event.key;
      setTimeout(() => polyrhythmInputRef.current.focus(), 0);
      setAddingPolyrhythm(true);
    }
  });

  return (
    <>
      <div style={{alignItems:'center', height:'100%', display: addingPolyrhythm ? 'none' : 'flex'}}>
        <button
          className="push-button"
          onClick={() => (setAddingPolyrhythm(true), setTimeout(() => polyrhythmInputRef.current.focus(), 0))}
        >add polyrhythm</button>

        <ExpandingSpacer />

        <button
          className="push-button"
          onClick={() => (selectionManager.selectedNotes.forEach(note => note.noteStyle = null), selectionManager.deselectAll())}
        >Clear</button>

        <ExpandingSpacer />

        <button
          className="push-button"
          onClick={() => selectionManager.deselectAll()}
        >Cancel</button>
      </div>
      <div style={{alignItems:'center', height:'100%', display: addingPolyrhythm ? 'flex' : 'none'}}>
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
          onClick={() => createPolyrhythm(polyrhythmInputRef.current?.value, selectionManager)}
        >go!</button>

        <ExpandingSpacer />

        <button
          className="push-button"
          onClick={() => (setAddingPolyrhythm(false), polyrhythmInputRef.current.value = '')}
        >Cancel</button>
      </div>
    </>
  );
}


const createPolyrhythm = (inputValue:string, selectionManager:SelectionManager) => {
  const polyrhythmLength = Number(inputValue);
  if (!polyrhythmLength)
    return;

  for (const track of selectionManager.trackRanges.keys()) {
    const [start, end] = selectionManager.trackRanges.get(track);
    track.addPolyrhythm(start, end, polyrhythmLength);
  }

  selectionManager.deselectAll();
}
