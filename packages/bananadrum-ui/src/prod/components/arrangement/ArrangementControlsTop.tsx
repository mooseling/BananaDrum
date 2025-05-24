import { ArrangementView } from "bananadrum-core";
import { getEventEngine } from "bananadrum-player";
import { useCallback, useContext, useRef, useState } from "react";
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
import { UndoRedo } from './UndoRedo';



const eventEngine = getEventEngine();


export function ArrangementControlsTop(): JSX.Element {
  const [playing, setPlaying] = useState(eventEngine.state === 'playing');
  useSubscription(eventEngine, () => setPlaying(eventEngine.state === 'playing'));

  const arrangement:ArrangementView = useContext(ArrangementPlayerContext).arrangement;

  const selectionManager = useContext(SelectionManagerContext);
  useSubscription(selectionManager, () => toggleOverlay('selection_controls', selectionManager.selections.size ? 'show' : 'hide'));

  const [editingTitle, setEditingTitle] = useState(false);
  const title = useStateSubscription(arrangement, (arrangement:ArrangementView) => arrangement.title);
  const titleVisible = title || editingTitle;

  const justFinishedEditingTitle = useRef(false);
  const onEditEnd = useCallback(() => {
    setEditingTitle(false);
    justFinishedEditingTitle.current = true;
    setTimeout(() => justFinishedEditingTitle.current = false, 100);
  }, []);

  const onClickEditTitle = useCallback(() => {
    if (!justFinishedEditingTitle.current)
      setEditingTitle(true);
  }, []);

  return (
    <>
      <div className={titleVisible ? '' : 'hidden'}>
        <ArrangementTitle editMode={editingTitle} onEditEnd={onEditEnd} />
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
        <SmallSpacer />
        <div className='other-controls-wrapper'>
          <button
            className="push-button medium gray edit-title-button"
            onClick={onClickEditTitle}
            >
            T&nbsp;<img src="images/icons/pencil_white.svg" style={{height:'0.78em'}} />
          </button>
          <SmallSpacer />
          <UndoRedo />
        </div>
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
