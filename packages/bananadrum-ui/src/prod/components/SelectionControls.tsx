import { useContext } from "react";
import { SelectionManagerContext } from "../BananaDrumUi";
import { NumberInput } from "./General";

export function SelectionControls(): JSX.Element {

  const selectionManager = useContext(SelectionManagerContext);

  const createPolyrhythm = (inputValue:string) => {
    const polyrhythmLength = Number(inputValue);
    if (!polyrhythmLength)
      return;

    const start = selectionManager.getFirst();
    const end = selectionManager.getLast();
    const track = start.track;

    track.addPolyrhythm(start, end, polyrhythmLength);
    selectionManager.clearSelection();
  }

  return (
    <div className="overlay-wrapper">
      <div className="time-control">
      New number of notes: <NumberInput
          getValue={() => '0'}
          setValue={createPolyrhythm}
        />
      </div>
    </div>
  );
}
