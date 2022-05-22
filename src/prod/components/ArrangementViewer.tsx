import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {Scrollbar, calculateThumbWidth, calculateThumbLeft} from './Scrollbar';
import {InstrumentBrowser} from './InstrumentBrowser';
import {Overlay, OverlayState} from './Overlay';
import {EventEngine} from '../EventEngine';
import {useState, useEffect, createContext, useRef} from 'react';


export const ArrangementPlayerContext = createContext(null);


export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [tracks, setTracks] = useState({...arrangement.tracks});
  const tracksSubscription = () => setTracks({...arrangement.tracks});
  const [eventEngineState, updateEventEngineState] = useState(EventEngine.state);
  const eventEngineSubscription = () => updateEventEngineState(EventEngine.state);
  const [overlayState] = useState(OverlayState(false));
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);

  // Scroll-shadows over the track-viewers
  // We need to recalculate these classes when:
  // -- The arrangement-viewer is first rendered
  // -- The track-viewer-wrapper scrolls
  // -- The track-viewer-wrapper resizes
  // -- Notes are added or removed
  const ref:React.LegacyRef<HTMLDivElement> = useRef();
  const [scrollShadowClasses, setScrollShadowClasses] = useState('');
  const updateScrollShadows = () => setScrollShadowClasses(getScrollShadowClasses(ref.current));
  const updateThumbWidth = () => setThumbWidth(calculateThumbWidth(ref.current));
  const updateThumbLeft = () => setThumbLeft(calculateThumbLeft(ref.current));

  const widthBasedCalcs = () => {
    updateScrollShadows();
    updateThumbWidth();
  }

  const scrollBasedUpdates = () => {
    updateScrollShadows();
    updateThumbLeft();
  }

  const resizeObserver = new ResizeObserver(widthBasedCalcs);
  const timeParamsSubscription = () => setTimeout(widthBasedCalcs, 0); // timeout so DOM updates first

  const thumbMoveCallback = (distance:number) => {
    const scrollbar = ref.current?.getElementsByClassName('custom-scrollbar')[0];
    if (scrollbar) {
      const noteLine = ref.current.getElementsByClassName('note-line')[0];
      if (noteLine) {
        const moveRatio = distance / (scrollbar.clientWidth - thumbWidth);
        const scrollableWidth = noteLine.clientWidth + 113;
        ref.current.scrollLeft += moveRatio * scrollableWidth;
        updateThumbLeft();
      }
    }
  }

  const trackMousedownCallback = (x:number) => {
    const scrollbar = ref.current?.getElementsByClassName('custom-scrollbar')[0];
    if (scrollbar) {
      const noteLine = ref.current.getElementsByClassName('note-line')[0];
      if (noteLine) {
        const scrollableWidth = noteLine.clientWidth + 113;
        const tapRatio = x / scrollbar.clientWidth;
        const wrapperWidth = ref.current.clientWidth;
        ref.current.scrollLeft = (scrollableWidth * tapRatio) - (wrapperWidth / 2);
        updateThumbLeft();
      }
    }
  }

  useEffect(() => {
    setTimeout(widthBasedCalcs, 0);

    arrangement.subscribe(tracksSubscription);
    EventEngine.subscribe(eventEngineSubscription);
    arrangement.timeParams.subscribe(timeParamsSubscription);
    resizeObserver.observe(ref.current);

    return () => {
      arrangement.unsubscribe(tracksSubscription);
      EventEngine.unsubscribe(eventEngineSubscription);
      resizeObserver.unobserve(ref.current);
      arrangement.timeParams.unsubscribe(timeParamsSubscription);
    }
  }, []);

  return (
    <ArrangementPlayerContext.Provider value={arrangementPlayer}>
      <div className="arrangement-viewer" event-engine-state={eventEngineState}>
        <div className="arrangement-viewer-head">
          <ArrangementControls />
        </div>
        <div className="arrangement-viewer-body overlay-wrapper">
          <div>
            <div
              className={`track-viewers-wrapper ${scrollShadowClasses}`}
              ref={ref}
              onScroll={scrollBasedUpdates}
            >
              {getTrackViewers(tracks)}
              <Scrollbar thumbWidth={thumbWidth} thumbLeft={thumbLeft} thumbMoveCallback={thumbMoveCallback} trackMousedownCallback={trackMousedownCallback}/>
            </div>
            <Overlay state={overlayState}>
              <InstrumentBrowser close={() => overlayState.visible && overlayState.toggle()}/>
            </Overlay>
          </div>
        </div>
        <button id="show-instrument-browser" className="push-button" onClick={() => !overlayState.visible && overlayState.toggle()}>Add Instrument</button>
      </div>
    </ArrangementPlayerContext.Provider>
  );
}


function getTrackViewers(tracks:{[trackId:string]: Banana.PotentialTrack}): JSX.Element[] {
  return Object.keys(tracks).map(trackId => (
    <TrackViewer
      track={tracks[trackId]}
      key={trackId}
    />
  ));
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
