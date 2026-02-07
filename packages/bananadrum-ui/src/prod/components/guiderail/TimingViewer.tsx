import { Timing, CopyRequest, PasteRequest } from 'bananadrum-core';
import { useContext, useMemo } from 'react';
import { BarDivisibilityContext } from './Guiderail';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer';
import { getParityClass } from '../note/NoteViewer';
import { BananaDrumContext } from '../BananaDrumViewer.js';

enum PasteDirection {
  Left,
  Right
}

type AdjacentCopyPasteRequest = {
  copyFrom: CopyRequest
  direction: PasteDirection
}

function AdjacentCopyBarControl({ copyFrom, direction }: AdjacentCopyPasteRequest): JSX.Element {
  let bananaDrum = useContext(BananaDrumContext);
    
  return (<div>
    {direction == PasteDirection.Left &&
      <button className='push-button medium gray' onClick={() => {copyPaste(copyFrom, copyFrom.start.bar - 1)}}>
        <img src="images/icons/undo_white.svg" style={{ height: '0.78em' }} />
      </button>
    }
    {direction == PasteDirection.Right &&
      <button className='push-button medium gray' onClick={() => {copyPaste(copyFrom, copyFrom.end.bar + 1)}}>
        <img src="images/icons/redo_white.svg" style={{ height: '0.78em' }} />
      </button>
    }
  </div>
  )
  

  function copyPaste(copyFrom: CopyRequest, pasteStartBar: number): void{
    let pasteStartTiming: Timing = { bar: pasteStartBar, step: 1 };
    let pasteTo: PasteRequest = { start: pasteStartTiming };

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
            isStartOfBar && timing.bar !== 1 && <AdjacentCopyBarControl copyFrom={{start: {bar: timing.bar, step: 1}, end: {bar: timing.bar, step: stepsPerBar}}} direction={PasteDirection.Left} />
          }
          {
            isEndOfBar && timing.bar !== length && <AdjacentCopyBarControl copyFrom={{start: {bar: timing.bar, step: 1}, end: {bar: timing.bar, step: stepsPerBar}}} direction={PasteDirection.Right} />
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