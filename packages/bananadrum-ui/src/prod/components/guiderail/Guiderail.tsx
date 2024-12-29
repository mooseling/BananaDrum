import { Arrangement } from 'bananadrum-core';
import { useStateSubscription } from '../../hooks/useStateSubscription';
import { rangeArray } from 'bananadrum-core/dist/prod/utils';
import { useContext } from 'react';
import { NoteLineMinWidth } from '../arrangement/ArrangementViewer';


export function Guiderail({arrangement}:{arrangement:Arrangement}): JSX.Element {
  const noteLineMinWidth = useContext(NoteLineMinWidth) + 'pt';
  const numBars = useStateSubscription(arrangement.timeParams, timeParams => timeParams.length);
  const display = numBars > 1 ? 'flex' : 'none';

  return (
    <div className='time-guide-wrapper'>
      <div className='timing-guide-meta'></div>
      <div className='timing-guide' style={{display, minWidth:noteLineMinWidth}}>
        {rangeArray(numBars, index => <BarGuide key={index + 1} barNumber={index + 1} />)}
      </div>
    </div>
  );
}


function BarGuide({barNumber}:{barNumber:number}): JSX.Element {
  return (<div className='bar-guide'><span className='bar-number'>{barNumber}</span></div>);
}