import { Arrangement } from "bananadrum-core";
import { useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { NumberInput } from "../General";



export function TimeControls({arrangement}:{arrangement:Arrangement}): JSX.Element {
  const {timeParams} = arrangement;
  const [, update] = useState({arrangement});

  useSubscription(timeParams, () => update({arrangement}));

  const pluralBars = timeParams.length > 1;

  return (
    <div className="time-controls-wrapper">
      <div className="time-control">
        <select className="short" onChange={changeTimeSignature} value={timeParams.timeSignature}>
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
