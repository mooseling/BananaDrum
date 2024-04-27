import { Arrangement } from "bananadrum-core";
import { getEventEngine } from "bananadrum-player";
import { useContext, useState } from "react";
import { SelectionManagerContext } from "../../BananaDrumUi";
import { useSubscription } from "../../hooks/useSubscription";
import { ExpandingSpacer } from "../ExpandingSpacer";
import { Overlay, toggleOverlay } from "../Overlay";
import { SelectionControls } from "../SelectionControls";
import { ShareButton } from "../ShareButton";
import { SmallSpacer } from "../SmallSpacer";
import { ArrangementPlayerContext } from "./ArrangementViewer";
import { TimeControls } from "./TimeControls";



const eventEngine = getEventEngine();


export function ArrangementControlsTop(): JSX.Element {
  const [playing, setPlaying] = useState(eventEngine.state === 'playing');
  useSubscription(eventEngine, () => setPlaying(eventEngine.state === 'playing'));

  const arrangement:Arrangement = useContext(ArrangementPlayerContext).arrangement;

  const selectionManager = useContext(SelectionManagerContext);
  useSubscription(selectionManager, () => toggleOverlay('selection_controls', selectionManager.selectedNotes.length ? 'show' : 'hide'));

  return (
    <div className="arrangement-controls arrangement-controls-top overlay-wrapper">
      {
        playing ? (
          <button className="playback-control push-button" onClick={() => eventEngine.stop()}>
            <img src="images/icons/pause.svg" alt="stop" />
          </button>
        ) : (
          <button className="playback-control push-button" onClick={() => eventEngine.play()}>
            <img src="images/icons/play.svg" alt="play" />
          </button>
        )
      }
      <SmallSpacer />
      <TimeControls arrangement={arrangement} />
      <SmallSpacer />
      <ExpandingSpacer />
      <ShareButton />
      <Overlay name="selection_controls">
        <SelectionControls />
      </Overlay>
    </div>
  );
}
