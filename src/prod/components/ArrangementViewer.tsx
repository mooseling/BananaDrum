import {TrackViewer} from './TrackViewer';
import {ArrangementControlsTop, ArrangementControlsBottom} from './ArrangementControls';
import {Scrollbar} from './Scrollbar';
import {Share} from './Share';
import {InstrumentBrowser} from './InstrumentBrowser';
import {Overlay, toggleOverlay} from './Overlay';
import {Publisher} from '../Publisher';
import {EventEngine} from '../EventEngine';
import {useState, useEffect, createContext, useRef} from 'react';


export const ArrangementPlayerContext = createContext(null);


export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [trackPlayers, setTrackPlayers] = useState({...arrangementPlayer.trackPlayers});
  const arrangementPlayerSubscription = () => setTrackPlayers({...arrangementPlayer.trackPlayers});
  const [eventEngineState, updateEventEngineState] = useState(EventEngine.state);
  const eventEngineSubscription = () => updateEventEngineState(EventEngine.state);

  // Scroll-shadows over the track-viewers
  // We need to recalculate these classes when:
  // -- The arrangement-viewer is first rendered
  // -- The track-viewer-wrapper scrolls
  // -- The track-viewer-wrapper resizes
  // -- Notes are added or removed
  const ref:React.MutableRefObject<HTMLDivElement> = useRef<HTMLDivElement>();
  const [scrollShadowClasses, setScrollShadowClasses] = useState('');
  const updateScrollShadows = () => setScrollShadowClasses(getScrollShadowClasses(ref.current));
  const resizeObserver = new ResizeObserver(updateScrollShadows);
  const contentWidthPublisher = Publisher()
  const timeParamsSubscription = () => setTimeout(() => {
    updateScrollShadows();
    contentWidthPublisher.publish();
  }, 0); // timeout so DOM updates first

  useEffect(() => {
    setTimeout(updateScrollShadows, 0);

    arrangementPlayer.subscribe(arrangementPlayerSubscription);
    EventEngine.subscribe(eventEngineSubscription);
    arrangement.timeParams.subscribe(timeParamsSubscription);
    resizeObserver.observe(ref.current);

    return () => {
      arrangementPlayer.unsubscribe(arrangementPlayerSubscription);
      EventEngine.unsubscribe(eventEngineSubscription);
      resizeObserver.unobserve(ref.current);
      arrangement.timeParams.unsubscribe(timeParamsSubscription);
    }
  }, []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
      <div className="arrangement-viewer overlay-wrapper" event-engine-state={eventEngineState}>
        <div className="arrangement-viewer-head">
          <ArrangementControlsTop />
        </div>
        <div className="arrangement-viewer-body overlay-wrapper">
          <div>
            <div
              className={`track-viewers-wrapper ${scrollShadowClasses}`}
              ref={ref}
              onScroll={updateScrollShadows}
            >
              {Object.keys(trackPlayers).map(trackId => (
                <TrackViewer
                  trackPlayer={trackPlayers[trackId]}
                  key={trackId}
                />
              ))}
              <Scrollbar wrapperRef={ref} contentWidthPublisher={contentWidthPublisher}/>
            </div>
            <Overlay name="instrument_browser">
              <InstrumentBrowser close={() => toggleOverlay('instrument_browser', 'hide')}/>
            </Overlay>
          </div>
        </div>
        <ArrangementControlsBottom />
        <Overlay name="share">
          <Share />
        </Overlay>
      </div>
    </ArrangementPlayerContext.Provider>
  );
}


// We need scroll shadows if the note-lines are out of site to either the left or the right
function getScrollShadowClasses(trackViewersWrapper: HTMLElement): string {
  const noteLine = trackViewersWrapper?.querySelector('.note-line-wrapper');
  if (!noteLine)
    return ''; // In case there are no tracks

  const {left: noteLineLeft, right: noteLineRight} = noteLine.getBoundingClientRect();

  // On the left side, the boundary is the right side of the track-metas
  const {right: metaRight} = trackViewersWrapper.querySelector('.track-meta').getBoundingClientRect();

  // On the right side, the boundary is right edge of the track-viewers-wrapper
  const {right: wrapperRight} = trackViewersWrapper.getBoundingClientRect();

  // This works much better with a little bit of tolerance, so we do a little subtraction
  if (noteLineRight - wrapperRight > 2) {
    if (metaRight - noteLineLeft > 2)
      return 'overflowing-left overflowing-right';
    return 'overflowing-right';
  }
  if (metaRight - noteLineLeft > 2)
    return 'overflowing-left';
  return '';
}
