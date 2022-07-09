import {useState, useEffect, useContext} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {ShareButton} from './ShareButton';
import {NumberInput} from './General';
import {EventEngine} from '../EventEngine';


export function ArrangementControls(): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <div className="arrangement-controls">
      <button className="playback-control push-button" onClick={() => EventEngine.play()}>Play</button>
      <button className="playback-control push-button" onClick={() => EventEngine.pause()}>Pause</button>
      <TimeControls arrangement={arrangement} />
      <ShareButton />
    </div>
  );
}


function TimeControls({arrangement}:{arrangement:Banana.Arrangement}): JSX.Element {
  const {timeParams} = arrangement;
  let [state, update] = useState({arrangement});

  const subscription = () => update({arrangement});
  useEffect(() => {
    timeParams.subscribe(subscription);
    return () => timeParams.unsubscribe(subscription);
  }, []);

  const pluralBars = timeParams.length > 1;

  return (
    <div className="time-controls-wrapper">
      <div className="time-control">
        <select onChange={changeTimeSignature}>
          <option>4/4</option>
          <option>6/8</option>
          <option>5/4</option>
          <option>7/8</option>
        </select> time
      </div>
      <div className="time-control">
        <NumberInput
          getValue={() => String(timeParams.tempo)}
          setValue={(newValue:string) => timeParams.tempo = Number(newValue)}
        /> bpm
      </div>
      <div className="time-control">
        <NumberInput
          getValue={() => String(timeParams.length)}
          setValue={(newValue:string) => timeParams.length = Number(newValue)}
        /> {pluralBars ? 'bars' : 'bar'}
      </div>
    </div>
  );


  function changeTimeSignature(event:React.ChangeEvent<HTMLSelectElement>) {
    timeParams.timeSignature = event.target.value;
    switch (event.target.value) {
      case '4/4':
        timeParams.stepResolution = 16;
        timeParams.pulse = '1/4';
        break;
      case '6/8':
        timeParams.stepResolution = 8;
        timeParams.pulse = '3/8';
        break;
      case '5/4':
        timeParams.stepResolution = 8;
        timeParams.pulse = '1/2';
        break;
      case '7/8':
        timeParams.stepResolution = 8;
        timeParams.pulse = '1/2';
        break;
    }
  }
}
