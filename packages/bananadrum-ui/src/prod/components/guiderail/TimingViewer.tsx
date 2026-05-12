import { Timing, CopyRequest, PasteRequest } from 'bananadrum-core';
import { useCallback, useContext, useMemo } from 'react';
import { BarDivisibilityContext } from './Guiderail';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer';
import { getParityClass } from '../note/NoteViewer';
import { BananaDrumContext } from '../BananaDrumViewer.js';

type PasteDirection = 'left' | 'right';

type AdjacentCopyPasteRequest = {
  copyFrom: CopyRequest
  direction: PasteDirection
}

function AdjacentCopyBarControl({ copyFrom, direction }: AdjacentCopyPasteRequest): JSX.Element {
  const bananaDrum = useContext(BananaDrumContext);
  
  let clickLeft = useCallback(() => {
    copyPaste(
      copyFrom,
      {
        start: { bar: copyFrom.start.bar - 1, step: 1 },
        end: { bar: copyFrom.start.bar - 1, step: copyFrom.end.step }
      }
    )
  },
    [copyFrom.start.bar, copyFrom.start.step, copyFrom.end.bar, copyFrom.end.step]);

  let clickRight = useCallback(() => {
    copyPaste(
      copyFrom,
      {
        start: { bar: copyFrom.start.bar + 1, step: 1 },
        end: { bar: copyFrom.start.bar + 1, step: copyFrom.end.step }
      }
    )
  },
    [copyFrom.start.bar, copyFrom.start.step, copyFrom.end.bar, copyFrom.end.step]);
  
  return (<div>
    {direction === 'left' &&
      <button className='push-button medium gray' onClick={clickLeft}>
        <img src="images/icons/undo_white.svg" style={{ height: '0.78em' }} />
      </button>
    }
    {direction === 'right' &&
      <button className='push-button medium gray' onClick={clickRight}>
        <img src="images/icons/redo_white.svg" style={{ height: '0.78em' }} />
      </button>
    }
  </div>
  )
  

  function copyPaste(copyFrom: CopyRequest, pasteTo: PasteRequest): void{

    bananaDrum.edit({
      arrangement: bananaDrum.arrangement,
      copyPaste: {
        copyFrom: copyFrom,
        pasteTo: pasteTo
      }
    });
  }
}



export function TimingViewer({timing}:{timing:Timing}): JSX.Element {
  const isStartOfBar = timing.step === 1;
  // compute end of bar  
  const {timeSignature, stepResolution, length} = useContext(ArrangementPlayerContext).arrangement.timeParams;
  const [beatsPerBar, beatUnit] = timeSignature.split('/').map(value => Number(value));
  const stepsPerBeat = stepResolution / beatUnit;
  const stepsPerBar = stepsPerBeat * beatsPerBar;
  const isEndOfBar = timing.step === stepsPerBar;

  const classes = useClasses(timing, isStartOfBar, isEndOfBar);
  const timingLabel = useTimingLabel(timing, isStartOfBar);

  return (
    <div className={classes}>
      <div className='guiderail-timing-content'>
        {timingLabel}
      </div>
      { (isStartOfBar || isEndOfBar) &&
        <div className='guiderail-control'>
          {
            isStartOfBar && timing.bar !== 1 && <AdjacentCopyBarControl copyFrom={{start: {bar: timing.bar, step: 1}, end: {bar: timing.bar, step: stepsPerBar}}} direction={'left'} />
          }
          {
            isEndOfBar && timing.bar !== length && <AdjacentCopyBarControl copyFrom={{start: {bar: timing.bar, step: 1}, end: {bar: timing.bar, step: stepsPerBar}}} direction={'right'} />
          }
        </div>
      }
    </div>);
}

function useClasses(timing:Timing, isStartOfBar:boolean, isEndOfBar:boolean): string {
  const {bar, step} = timing;
  const {timeSignature, stepResolution} = useContext(ArrangementPlayerContext).arrangement.timeParams;

  return useMemo(
    () => `guiderail-timing note-width ${getParityClass(bar, step, timeSignature, stepResolution)} ${isStartOfBar ? 'start-of-bar' : ''} ${isEndOfBar ? 'end-of-bar' : ''}`,
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