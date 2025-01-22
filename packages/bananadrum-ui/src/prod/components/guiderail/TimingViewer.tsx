import { Timing } from 'bananadrum-core';

export function TimingViewer({timing}:{timing:Timing}): JSX.Element {
  const startOfBar = timing.step === 1;
  return (<div className={`guiderail-timing note-width ${startOfBar ? 'start-of-bar' : ''}`}>
    <div className='guiderail-timing-content'>
      {startOfBar ? timing.bar : ''}
    </div>
  </div>);
}