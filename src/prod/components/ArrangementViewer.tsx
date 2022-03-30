import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {InstrumentBrowser} from './InstrumentBrowser';
import {Overlay, OverlayState} from './Overlay';
import {EventEngine} from '../EventEngine';
import {useState, useEffect, createContext, useRef} from 'react';


export const ArrangementPlayerContext = createContext(null);


export function ArrangementViewer({arrangementPlayer}:{arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  const {arrangement} = arrangementPlayer;
  const [tracks, setTracks] = useState({...arrangement.tracks});
  const [eventEngineState, updateEventEngineState] = useState(EventEngine.state);

  // Create Overlay-publisher on initial component creation
  const [overlayState] = useState(OverlayState(false));

  const tracksSubscription = () => setTracks({...arrangement.tracks});
  useEffect(() => {
    arrangement.subscribe(tracksSubscription);
    return () => arrangement.unsubscribe(tracksSubscription);
  }, []);

  const eventEngineSubscription = () => updateEventEngineState(EventEngine.state);
  useEffect(() => {
    EventEngine.subscribe(eventEngineSubscription);
    return () => EventEngine.unsubscribe(eventEngineSubscription);
  }, []);

  // Scroll-shadows over the track-viewers
  // We need to recalculate these classes when:
  // -- The arrangement-viewer is first rendered
  // -- The track-viewer-wrapper scrolls
  // -- The track-viewer-wrapper resizes
  // -- Notes are added or removed
  const ref = useRef();
  const [scrollShadowClasses, setScrollShadowClasses] = useState('');
  const updateScrollShadows = () => setScrollShadowClasses(getScrollShadowClasses(ref.current));
  const timeParamsSubscription = () => setTimeout(updateScrollShadows, 0); // time-out so DOM has updated first
  useEffect(() => {
    updateScrollShadows(); // Update on first render
    const resizeObserver = new ResizeObserver(updateScrollShadows);
    resizeObserver.observe(ref.current); // Watch for track-viewers-wrapper resize
    arrangement.timeParams.subscribe(timeParamsSubscription); // Watch for length changes
    return () => {
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
          <div className={`track-viewers-wrapper ${scrollShadowClasses}`} ref={ref} onScroll={updateScrollShadows}>
            {getTrackViewers(tracks)}
          </div>
          <button id="show-instrument-browser" className="push-button" onClick={() => !overlayState.visible && overlayState.toggle()}>Add Instrument</button>
          <Overlay state={overlayState}>
            <InstrumentBrowser close={() => overlayState.visible && overlayState.toggle()}/>
          </Overlay>
        </div>
      </div>
    </ArrangementPlayerContext.Provider>
  );
}


function getTrackViewers(tracks:{[trackId:string]: Banana.Track}): JSX.Element[] {
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
