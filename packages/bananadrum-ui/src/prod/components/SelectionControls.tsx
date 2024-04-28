import { useContext } from "react";
import { SelectionManagerContext } from "../BananaDrumUi";
import { SelectionManager } from "../SelectionManager";
import { NumberInput } from "./General";



export function SelectionControls(): JSX.Element {
  const selectionManager = useContext(SelectionManagerContext);

  return (
    <div className="overlay-wrapper">
      <div className="time-control">
      New number of notes: <NumberInput
          getValue={() => '0'}
          setValue={value => createPolyrhythm(value, selectionManager)}
        />
      </div>
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
