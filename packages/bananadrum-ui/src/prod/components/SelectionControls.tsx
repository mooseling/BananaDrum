import { useContext, useRef, useState } from "react";
import { SelectionManagerContext } from "../BananaDrumUi";
import { useKeyboardEvent } from "../hooks/useKeyboardEvent";
import { useSubscription } from "../hooks/useSubscription";
import { SelectionManager } from "../SelectionManager";
import { ExpandingSpacer } from "./ExpandingSpacer";
import { OverlayStateContext } from "./Overlay";
import { SmallSpacer } from "./SmallSpacer";



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
    if (!(event.target instanceof HTMLInputElement) && selectionManager.selections.size && polyrhythmInputRef.current && digitMatcher.test(event.key)) {
      polyrhythmInputRef.current.value = event.key;
      setTimeout(() => polyrhythmInputRef.current.focus(), 0);
      setAddingPolyrhythm(true);
    }
  });

  return (
    <div className={`selection-controls ${addingPolyrhythm ? 'adding-polyrhythm' : ''}`} style={{width:'100%', height:'100%'}}>
      <div style={{alignItems:'center', height:'100%', display: addingPolyrhythm ? 'none' : 'flex'}}>
        <button
          className="push-button"
          onClick={() => (setAddingPolyrhythm(true), setTimeout(() => polyrhythmInputRef.current.focus(), 0))}
        >add polyrhythm</button>

        <SmallSpacer />

        <button
          className="push-button"
          onClick={() => (selectionManager.selections.forEach(({selectedNotes}) => selectedNotes.forEach(note => note.noteStyle = null)), selectionManager.deselectAll())}
        >Clear sounds</button>

        <ExpandingSpacer />
        <SmallSpacer />

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
        <SmallSpacer />

        <button
          className="push-button"
          onClick={() => (setAddingPolyrhythm(false), polyrhythmInputRef.current.value = '')}
        >Cancel</button>
      </div>
    </div>
  );
}


function createPolyrhythm (inputValue:string, selectionManager:SelectionManager): void {
  const polyrhythmLength = Number(inputValue);
  if (!polyrhythmLength)
    return;

  selectionManager.selections.forEach(({range}) => {
    const [start, end] = range;
    start.track.addPolyrhythm(start, end, polyrhythmLength);
  });

  selectionManager.deselectAll();
}
