import { Arrangement } from 'bananadrum-core';
import { useStateSubscription } from '../../hooks/useStateSubscription';
import { TimingViewer } from './TimingViewer';


export function Guiderail({arrangement}:{arrangement:Arrangement}): JSX.Element {


  // We don't actual use numNotes, but we know we need to render when it changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const numNotes = useStateSubscription(arrangement.timeParams, timeParams => timeParams.timings.length);

  // Because only time-param can change at a time, we know numBars only ever changes if numNotes also changes
  const numBars = arrangement.timeParams.length;
  const display = numBars > 1 ? 'flex' : 'none';

  return (
    <div className='guiderail-wrapper'>
      <div className='guiderail-meta'></div>
      <div className='guiderail' style={{display}}>
        {arrangement.timeParams.timings.map(timing => <TimingViewer timing={timing} key={`${timing.bar}.${timing.step}`}/>)}
      </div>
    </div>
  );
}
