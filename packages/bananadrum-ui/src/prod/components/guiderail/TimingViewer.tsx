import { Timing } from 'bananadrum-core';

export function TimingViewer({timing}:{timing:Timing}): JSX.Element {
  const startOfBar = timing.step === 1;
  return (<div className={`guiderail-timing note-width ${startOfBar ? 'start-of-bar' : ''}`}>
    {startOfBar ? timing.bar : ''}
  </div>);
}