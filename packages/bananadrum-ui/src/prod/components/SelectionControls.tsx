import { useContext, useRef, useState } from "react";
import { SelectionManagerContext } from "../BananaDrumUi";
import { useKeyboardEvent } from "../hooks/useKeyboardEvent";
import { useSubscription } from "../hooks/useSubscription";
import { SelectionManager } from "../SelectionManager";
import { ExpandingSpacer } from "./ExpandingSpacer";
import { OverlayStateContext } from "./Overlay";
import { SmallSpacer } from "./SmallSpacer";
import { useEditCommand, EditFunction } from '../hooks/useEditCommand';
import { ArrangementPlayerContext } from './arrangement/ArrangementViewer';



const digitMatcher = /^\d$/;


export function SelectionControls(): JSX.Element {
  const arrangement = useContext(ArrangementPlayerContext).arrangement;
  const selectionManager = useContext(SelectionManagerContext);
  const overlayState = useContext(OverlayStateContext);
  const polyrhythmInputRef = useRef<HTMLInputElement>(null);
  const edit = useEditCommand();

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
          onClick={() => (edit({arrangement, clearSelection:selectionManager.selections}), selectionManager.deselectAll())}
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
              createPolyrhythm((event.target as HTMLInputElement).value, selectionManager, arrangement, edit);
          }}
          ref={polyrhythmInputRef}
          />
        </div>

        <button
          className="push-button"
          onClick={() => createPolyrhythm(polyrhythmInputRef.current?.value, selectionManager, arrangement, edit)}
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


function createPolyrhythm(inputValue:string, selectionManager:SelectionManager, arrangement, edit:EditFunction): void {
  const length = Number(inputValue);
  if (!length)
    return;

  edit({arrangement, addPolyrhythms:{length, selection:selectionManager.selections}})

  selectionManager.deselectAll();
}
