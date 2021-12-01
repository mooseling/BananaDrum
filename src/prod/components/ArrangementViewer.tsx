import {TrackViewer} from './TrackViewer';
import {ArrangementControls} from './ArrangementControls';
import {useState, useEffect, createRef} from 'react';

let lastTiming:Timing = '0';
let ref;

export function ArrangementViewer({arrangement, arrangementPlayer}:{arrangement:Arrangement, arrangementPlayer:ArrangementPlayer}): JSX.Element {
  ref = createRef<HTMLDivElement>();
  let [state, update] = useState({arrangement});
  useEffect(() => arrangement.timeParams.subscribe(() => update({arrangement})), []);

  useEffect(() => arrangementPlayer.subscribe(() => highlightTiming(arrangementPlayer.getCurrentTiming(), ref)), []);

  return (
    <div className="arrangement-viewer" ref={ref}>
      <ArrangementControls arrangement={arrangement}/>
      {arrangement.tracks.map(track => (
        <TrackViewer
          track={track}
          key={track.instrument.instrumentId}
          arrangement={arrangement}/>
      ))}
    </div>
  );
}



function highlightTiming(timingToHighlight:Timing, ref:React.RefObject<HTMLDivElement>) {
  if (timingToHighlight !== lastTiming) {
    lastTiming = timingToHighlight;
    const noteViewers:NodeList = ref.current.querySelectorAll('.note-viewer');
    noteViewers.forEach((noteViewer:Element) => {
      const timing:Timing = noteViewer.getAttribute('timing');
      if (timing === timingToHighlight)
        noteViewer.classList.add('current-timing');
      else
        noteViewer.classList.remove('current-timing');
    });
  }
}
