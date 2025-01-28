import { Arrangement, TimeParams } from 'bananadrum-core';
import { useStateSubscription } from '../../hooks/useStateSubscription';
import { TimingViewer } from './TimingViewer';
import { createContext } from 'react';


export type BarDivisibility = 1 | 2 | 4;
export const BarDivisibilityContext = createContext<BarDivisibility>(null);


export function Guiderail({arrangement}:{arrangement:Arrangement}): JSX.Element {

  // We don't actual use numNotes, but we know we need to render when it changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const numNotes = useStateSubscription(arrangement.timeParams, timeParams => timeParams.timings.length);

  // Because only time-param can change at a time, we know numBars only ever changes if numNotes also changes
  const numBars = arrangement.timeParams.length;
  const display = numBars > 1 ? 'block' : 'none';

  const barDivisibility = useStateSubscription(arrangement.timeParams, getBarDivisibility);

  return (
    <BarDivisibilityContext.Provider value={barDivisibility}>
    <div className='guiderail-wrapper' style={{display}}>
      <div className='guiderail-meta'></div>
      <div className='guiderail'>
        {arrangement.timeParams.timings.map(timing => <TimingViewer timing={timing} key={`${timing.bar}.${timing.step}`}/>)}
      </div>
      <div className="scrollshadow left-scrollshadow" />
      <div className="scrollshadow right-scrollshadow" />
    </div>
    </BarDivisibilityContext.Provider>
  );
}


function getBarDivisibility(timeParams:TimeParams): BarDivisibility {
  const beatsPerBar = Number(timeParams.timeSignature.split('/')[0]);
  if (beatsPerBar % 4 === 0)
    return 4;
  if (beatsPerBar % 2 === 0)
    return 2;
  return 1;
}
