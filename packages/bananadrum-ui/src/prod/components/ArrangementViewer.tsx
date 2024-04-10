import { Publisher, RealTime } from 'bananadrum-core';
import { ArrangementPlayer, TrackPlayer } from 'bananadrum-player';
import { createPublisher } from 'bananadrum-core';
import { TrackViewer } from './TrackViewer.js';
import { ArrangementControlsTop, ArrangementControlsBottom } from './ArrangementControls.js';
import { Scrollbar } from './Scrollbar.js';
import { Share } from './Share.js';
import { InstrumentBrowser } from './InstrumentBrowser.js';
import { Overlay, toggleOverlay } from './Overlay.js';
import { useState, useEffect, createContext, useRef, useContext, TouchEvent } from 'react';
import { AnimationEngineContext } from './BananaDrumViewer.js';
import { AnimationEngine } from '../types.js';
import { useSubscription } from '../hooks/useSubscription.js';
import { createSelectionManager, SelectionManager } from '../SelectionManager.js';

export const ArrangementPlayerContext = createContext<ArrangementPlayer>(null);
export const TrackWidthPublisherContext = createContext<Publisher>(null);
export const SelectionManagerContext = createContext<SelectionManager>(null);


export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [trackPlayers, setTrackPlayers] = useState({...arrangementPlayer.trackPlayers});
  const animationEngine = useContext(AnimationEngineContext);

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
  const contentWidthPublisher = createPublisher();
  const selectionManager = createSelectionManager();

  const {trackViewerCallbacks, handleWheel, onScrollbarGrab} = useAutoFollow(animationEngine, arrangementPlayer, ref);

  useSubscription(arrangementPlayer, () => setTrackPlayers({...arrangementPlayer.trackPlayers}));
  useSubscription(arrangement.timeParams, () => setTimeout(() => {
    updateScrollShadows();
    contentWidthPublisher.publish();
  }, 0)); // timeout so DOM updates first)

  useEffect(() => {
    setTimeout(updateScrollShadows, 0);
    resizeObserver.observe(ref.current);
    return () => resizeObserver.unobserve(ref.current);
  }, []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
    <TrackWidthPublisherContext.Provider value={contentWidthPublisher}>
    <SelectionManagerContext.Provider value={selectionManager}>
      <div className="arrangement-viewer overlay-wrapper">
        <div className="arrangement-viewer-head">
          <ArrangementControlsTop />
        </div>
        <div className="arrangement-viewer-body overlay-wrapper">
          <div>
            <div
              className={`track-viewers-wrapper ${scrollShadowClasses}`}
              ref={ref}
              onScroll={updateScrollShadows}
              onWheel={handleWheel}
            >
              {
                Object.keys(trackPlayers)
                  .sort((a, b) => sortTracks(trackPlayers[a], trackPlayers[b]))
                  .map(trackId => (
                    <TrackViewer
                      trackPlayer={trackPlayers[trackId]}
                      callbacks={trackViewerCallbacks}
                      key={trackId}
                    />
                  ))
              }
              <Scrollbar wrapperRef={ref} contentWidthPublisher={contentWidthPublisher} callbacks={{onGrab:onScrollbarGrab}}/>
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
    </SelectionManagerContext.Provider>
    </TrackWidthPublisherContext.Provider>
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


function sortTracks(trackPlayer1:TrackPlayer, trackPlayer2:TrackPlayer): number {
  const track1 = trackPlayer1.track;
  const track2 = trackPlayer2.track;

  if (track1.instrument.displayOrder === track2.instrument.displayOrder) {
    return Number(track1.id) - Number(track2.id);
  }

  return track1.instrument.displayOrder - track2.instrument.displayOrder;
}


function autoFollow(wrapper:HTMLDivElement, arrangementPlayer:ArrangementPlayer, realTime:RealTime) {
  const distanceMultiplier = arrangementPlayer.convertToLoopProgress(realTime);
  wrapper.scrollLeft = (distanceMultiplier * wrapper.scrollWidth) - (wrapper.offsetWidth / 2);
}


function useAutoFollow(animationEngine: AnimationEngine, arrangementPlayer: ArrangementPlayer, wrapperRef:React.MutableRefObject<HTMLDivElement>) {
  // Placing auto-follow in state means we rerender when toggling auto-follow
  // This means we get register/don't register auto-follow callbacks based on state
  // The alternative is to use a ref, always fire the callbacks, and use the ref to decide then what to do
  const [autoFollowIsOn, setAutoFollow] = useState(true);

  useEffect(() => {
    // If desired, turn on auto-follow like so
    if (autoFollowIsOn) {
      const autoFollowAnimation = realTime => autoFollow(wrapperRef.current, arrangementPlayer, realTime);
      animationEngine.connect(autoFollowAnimation);
      return () => animationEngine.disconnect(autoFollowAnimation);
    }

    // Otherwise, set up the subscription which will turn it on again
    const animationEngineSubscription = () => animationEngine.state === 'playing' && setAutoFollow(true);
    animationEngine.subscribe(animationEngineSubscription);
    return () => animationEngine.unsubscribe(animationEngineSubscription)
  }, [autoFollowIsOn]);

  return {
    handleWheel: autoFollowIsOn ? (event:React.WheelEvent<HTMLDivElement>) => event.deltaX > 6 && setAutoFollow(false) : undefined,
    onScrollbarGrab: autoFollowIsOn ? () => setAutoFollow(false) : undefined,
    trackViewerCallbacks: useTrackViewerTouchInterpretation(autoFollowIsOn, setAutoFollow)
  }
}


function useTrackViewerTouchInterpretation(autoFollowIsOn, setAutoFollow) {
  // Touchscreens:
  // If user touches the tracks while we're auto-following
  // If they are scrolling up or down, we do nothing
  // If they are scrolling left or right, we stop auto-following
  // If they hold for a whole second, we stop auto-following

  const [userMightBeTakingControl, setUserMightBeTakingControl] = useState(false);
  const lastY = useRef(0);
  const lastX = useRef(0);
  const stopAutoFollowTimeoutId = useRef(0);

  if (!autoFollowIsOn) {
    return {
      noteLineTouchStart: undefined,
      noteLineTouchMove: undefined,
      noteLineTouchEnd: undefined
    };
  }

  if (userMightBeTakingControl) {
    return {
      noteLineTouchStart: undefined,
      noteLineTouchMove: (event:TouchEvent) => {
        if (Math.abs(lastX.current - event.touches[0].pageX) > 10) {
          setAutoFollow(false);
          clearTimeout(stopAutoFollowTimeoutId.current);
          setUserMightBeTakingControl(false);
          return;
        }

        if (Math.abs(lastY.current - event.touches[0].pageY) > 10) {
          clearTimeout(stopAutoFollowTimeoutId.current);
          setUserMightBeTakingControl(false);
        }
      },
      noteLineTouchEnd: () => setUserMightBeTakingControl(false)
    };
  } else {
    return {
      noteLineTouchStart: (event:TouchEvent) => {
        if (event.touches.length != 1)
          return;

        lastY.current = event.touches[0].pageY;
        lastX.current = event.touches[0].pageX;
        stopAutoFollowTimeoutId.current = setTimeout(() => setAutoFollow(false), 1000);

        setUserMightBeTakingControl(true)
      },
      noteLineTouchMove: undefined,
      noteLineTouchEnd: undefined
    };
  }
}
