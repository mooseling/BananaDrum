import {useState, useEffect, useContext} from 'react';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {NumberInput} from './General';
import {EventEngine} from '../EventEngine';


export function ArrangementControls(): JSX.Element {
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <div className="arrangement-controls">
      <button className="playback-control push-button" onClick={() => EventEngine.play()}>Play</button>
      <button className="playback-control push-button" onClick={() => EventEngine.pause()}>Pause</button>
      <TimeControls arrangement={arrangement} />
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

  return (
    <div className="time-controls">
      Tempo: <NumberInput
        getValue={() => String(timeParams.tempo)}
        setValue={(newValue:string) => timeParams.tempo = Number(newValue)}
      /> bpm<br/>
      Length: <NumberInput
        getValue={() => String(timeParams.length)}
        setValue={(newValue:string) => timeParams.length = Number(newValue)}
      /> bars
    </div>
  );
}
