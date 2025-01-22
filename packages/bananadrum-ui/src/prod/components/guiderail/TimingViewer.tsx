import { Timing } from 'bananadrum-core';
import { useContext } from 'react';
import { BarDivisibilityContext } from './Guiderail';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer';


export function TimingViewer({timing}:{timing:Timing}): JSX.Element {
  const isStartOfBar = timing.step === 1;

  if (isStartOfBar){
    return (<div className={'guiderail-timing note-width start-of-bar'}>
      <div className='guiderail-timing-content'>
        {timing.bar}
      </div>
    </div>);
  }

  return (<div className={'guiderail-timing note-width'}>
    <div className='guiderail-timing-content'>
      {getTimingLabel(timing)}
    </div>
  </div>);
}


function getTimingLabel(timing:Timing): string {
  const barDivisibility = useContext(BarDivisibilityContext);
  const {arrangement} = useContext(ArrangementPlayerContext);

  if (barDivisibility === 1)
    return '';

  const stepFromZero = timing.step - 1; // Steps count from 1, but we need to do math starting from 0 below

  if (barDivisibility === 2) {
    const [beatsPerBar, beatUnit] = arrangement.timeParams.timeSignature.split('/').map(value => Number(value));
    const stepsPerBeat = arrangement.timeParams.stepResolution / beatUnit;
    const stepsPerBar = stepsPerBeat * beatsPerBar;

    if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.5)
      return timing.bar + '.2';
  }

  if (barDivisibility === 4) {
    const [beatsPerBar, beatUnit] = arrangement.timeParams.timeSignature.split('/').map(value => Number(value));
    const stepsPerBeat = arrangement.timeParams.stepResolution / beatUnit;
    const stepsPerBar = stepsPerBeat * beatsPerBar;

    if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.25)
      return timing.bar + '.2';
    if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.5)
      return timing.bar + '.3';
    if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.75)
      return timing.bar + '.4';
  }

  return '';
}