import {assert} from 'chai';
import {createTimeParams} from '../../prod/TimeParams.js';

describe('TimeParams', function() {
  const initialTimeSignature = '4/4';
  const initialTempo = 120;
  const initialLength = 1;
  const timeParams = createTimeParams({
    timeSignature:initialTimeSignature,
    tempo:initialTempo,
    length:initialLength,
    pulse:'1/4',
    stepResolution:8
  });
  let updateCount = 0;
  timeParams.subscribe(() => updateCount++)

  it('has the right properties initially', () => {
    assert(timeParams.timeSignature === initialTimeSignature);
    assert(timeParams.tempo === initialTempo);
    assert(timeParams.length === initialLength);
  });

  it('can be updated', () => {
    const newTimeSignature = '5/4';
    const newTempo = 140
    const newLength = 2
    timeParams.timeSignature = newTimeSignature;
    timeParams.tempo = newTempo;
    timeParams.length = newLength;
    assert(timeParams.timeSignature === newTimeSignature);
    assert(timeParams.tempo === newTempo);
    assert(timeParams.length === newLength);
  });

  it('publishes when it is changed', () => {
    timeParams.timeSignature = '4/4';
    timeParams.tempo = 120;
    timeParams.length = 1;
    const initialUpdateCount = updateCount;
    timeParams.timeSignature = '5/4';
    assert(updateCount === initialUpdateCount + 1);
    timeParams.tempo = 140;
    assert(updateCount === initialUpdateCount + 2);
    timeParams.length = 2;
    assert(updateCount === initialUpdateCount + 3);
  });

  it("...but doesn't publish when edits don't actually change anything", () => {
    timeParams.timeSignature = '4/4';
    timeParams.tempo = 120;
    timeParams.length = 1;
    const initialUpdateCount = updateCount;
    timeParams.timeSignature = '4/4';
    assert(updateCount === initialUpdateCount);
    timeParams.tempo = 120;
    assert(updateCount === initialUpdateCount);
    timeParams.length = 1;
    assert(updateCount === initialUpdateCount);
  });
});
