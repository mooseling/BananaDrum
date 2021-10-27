export function TrackViewer({track}:{track:Track}): JSX.Element {
  return (
    <div className="track-viewer">
      <TrackMeta track={track}/>
    </div>
  );
}


function TrackMeta({track}:{track:Track}): JSX.Element {
  const instrumentName = track.instrument.displayName;
  return (
    <div className="track-meta" key={track.instrument.instrumentId}>
      {instrumentName}
    </div>
  );
}
