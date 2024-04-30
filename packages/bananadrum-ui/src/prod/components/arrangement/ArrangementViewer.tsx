import { RealTime } from 'bananadrum-core';
import { ArrangementPlayer, TrackPlayer } from 'bananadrum-player';
import { createPublisher } from 'bananadrum-core';
import { TrackViewer } from '../TrackViewer.js';
import { Scrollbar } from '../Scrollbar.js';
import { Share } from '../Share.js';
import { InstrumentBrowser } from '../InstrumentBrowser.js';
import { Overlay, toggleOverlay } from '../Overlay.js';
import { useState, useEffect, createContext, useRef, useContext, TouchEvent } from 'react';
import { AnimationEngineContext } from '../BananaDrumViewer.js';
import { AnimationEngine } from '../../types.js';
import { useSubscription } from '../../hooks/useSubscription.js';
import { ArrangementControlsTop } from './ArrangementControlsTop.js';
import { ArrangementControlsBottom } from './ArrangementControlsBottom.js';



export const ArrangementPlayerContext = createContext<ArrangementPlayer>(null);
export const NoteWidthContext = createContext<number>(null);


export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [trackPlayerCount, setTrackPlayerCount] = useState(arrangementPlayer.trackPlayers.size);
  const animationEngine = useContext(AnimationEngineContext);

  // Scroll-shadows over the track-viewers
  // We need to recalculate these classes when:
  // -- The arrangement-viewer is first rendered
  // -- The track-viewer-wrapper scrolls
  // -- The track-viewer-wrapper resizes
  // -- Notes are added or removed
  const ref:React.MutableRefObject<HTMLDivElement> = useRef<HTMLDivElement>();
  const [scrollShadowClasses, setScrollShadowClasses] = useState('');
  const [noteWidth, setNoteWidth] = useState(0);
  const updateScrollShadows = () => setScrollShadowClasses(getScrollShadowClasses(ref.current));
  const updateNoteWidth = () => setNoteWidth(getNoteWidth(ref.current));
  const contentWidthPublisher = createPublisher();

  const {trackViewerCallbacks, handleWheel, onScrollbarGrab} = useAutoFollow(animationEngine, arrangementPlayer, ref);

  useSubscription(arrangementPlayer, () => setTrackPlayerCount(arrangementPlayer.trackPlayers.size));
  useSubscription(arrangement.timeParams, () => setTimeout(() => {
    updateScrollShadows();
    contentWidthPublisher.publish();
    updateNoteWidth();
  }, 0)); // timeout so DOM updates first

  useEffect(() => {
    const handleResize = () => (updateScrollShadows(), updateNoteWidth());
    const resizeObserver = new ResizeObserver(handleResize);
    setTimeout(handleResize, 0);
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
    <NoteWidthContext.Provider value={noteWidth}>
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
                arrangement.tracks
                  .map(track => arrangementPlayer.trackPlayers.get(track))
                  .map(trackPlayer => (
                    <TrackViewer
                      trackPlayer={trackPlayer}
                      callbacks={trackViewerCallbacks}
                      key={trackPlayer.track.id}
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
    </NoteWidthContext.Provider>
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


function getNoteWidth(trackViewersWrapper: HTMLElement): number {
  const noteViewer = trackViewersWrapper?.querySelector('.note-line-wrapper .notes-wrapper .note-viewer');
  if (!noteViewer)
    return 0; // In case there are no tracks

  return noteViewer.clientWidth;
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
