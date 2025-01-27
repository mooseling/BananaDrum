import { Timing } from 'bananadrum-core';
import { useContext, useMemo } from 'react';
import { BarDivisibilityContext } from './Guiderail';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer';
import { getParityClass } from '../note/NoteViewer';


export function TimingViewer({timing}:{timing:Timing}): JSX.Element {
  const isStartOfBar = timing.step === 1;

  const classes = useClasses(timing, isStartOfBar);
  const timingLabel = useTimingLabel(timing, isStartOfBar);

  return (<div className={classes}>
    <div className='guiderail-timing-content'>
      {timingLabel}
    </div>
  </div>);
}


function useClasses(timing:Timing, isStartOfBar:boolean): string {
  const {bar, step} = timing;
  const {timeSignature, stepResolution} = useContext(ArrangementPlayerContext).arrangement.timeParams;

  return useMemo(
    () => `guiderail-timing note-width ${getParityClass(bar, step, timeSignature, stepResolution)} ${isStartOfBar ? 'start-of-bar' : ''}`,
    [bar, step, timeSignature, stepResolution, isStartOfBar]
  );
}


function useTimingLabel(timing:Timing, isStartOfBar:boolean): string {
  const barDivisibility = useContext(BarDivisibilityContext);
  const {arrangement} = useContext(ArrangementPlayerContext);
  const {timeSignature, stepResolution} = arrangement.timeParams;

  const {bar, step} = timing;

  return useMemo(() => {
      if (isStartOfBar)
        return bar.toString();

      if (barDivisibility === 1)
        return '';

      const stepFromZero = step - 1; // Steps count from 1, but we need to do math starting from 0 below

      if (barDivisibility === 2) {
        const [beatsPerBar, beatUnit] = timeSignature.split('/').map(value => Number(value));
        const stepsPerBeat = stepResolution / beatUnit;
        const stepsPerBar = stepsPerBeat * beatsPerBar;

        if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.5)
          return bar + '.2';
      }

      if (barDivisibility === 4) {
        const [beatsPerBar, beatUnit] = timeSignature.split('/').map(value => Number(value));
        const stepsPerBeat = stepResolution / beatUnit;
        const stepsPerBar = stepsPerBeat * beatsPerBar;

        if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.25)
          return bar + '.2';
        if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.5)
          return bar + '.3';
        if ((stepFromZero % stepsPerBar) / stepsPerBar === 0.75)
          return bar + '.4';
      }

      return '';
    },
    [barDivisibility, bar, step, isStartOfBar, timeSignature, stepResolution]
  );
}