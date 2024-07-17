import { Arrangement } from "bananadrum-core";
import { getEventEngine } from "bananadrum-player";
import { useCallback, useContext, useState } from "react";
import { SelectionManagerContext } from "../../BananaDrumUi";
import { useSubscription } from "../../hooks/useSubscription";
import { ExpandingSpacer } from "../ExpandingSpacer";
import { Overlay, toggleOverlay } from "../Overlay";
import { SelectionControls } from "../SelectionControls";
import { ShareButton } from "../ShareButton";
import { SmallSpacer } from "../SmallSpacer";
import { ArrangementPlayerContext } from "./ArrangementViewer";
import { TimeControls } from "./TimeControls";
import { ArrangementTitle } from "./ArrangementTitle";
import { useStateSubscription } from "../../hooks/useStateSubscription";



const eventEngine = getEventEngine();


export function ArrangementControlsTop(): JSX.Element {
  const [playing, setPlaying] = useState(eventEngine.state === 'playing');
  useSubscription(eventEngine, () => setPlaying(eventEngine.state === 'playing'));

  const arrangement:Arrangement = useContext(ArrangementPlayerContext).arrangement;

  const selectionManager = useContext(SelectionManagerContext);
  useSubscription(selectionManager, () => toggleOverlay('selection_controls', selectionManager.selections.size ? 'show' : 'hide'));

  const [editingTitle, setEditingTitle] = useState(false);
  const title = useStateSubscription(arrangement, (arrangement:Arrangement) => arrangement.title);
  const titleVisible = title || editingTitle;

  return (
    <>
      <div className={titleVisible ? '' : 'hidden'}>
        <ArrangementTitle editMode={editingTitle} onEditEnd={() => setEditingTitle(false)} />
      </div>
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
        <button
          className="push-button medium gray"
          style={{
            marginLeft:'12pt',
            fontSize: '20.5pt',
            fontFamily: 'serif',
            textTransform: 'capitalize', // .push-button normally lower-cases contents
            lineHeight: '1em'
          }}
          onClick={() => setEditingTitle(true)}
          >
          T&nbsp;<img src="images/icons/pencil_white.svg" style={{height:'0.78em'}} />
        </button>
        <SmallSpacer />
        <ExpandingSpacer />
        <ShareButton />
        <Overlay name="selection_controls">
          <SelectionControls />
        </Overlay>
      </div>
    </>
  );
}
