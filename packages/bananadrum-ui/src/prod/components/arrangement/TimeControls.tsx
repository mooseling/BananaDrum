import { ArrangementView, EditCommand_TimeParamsTimeSignature } from "bananadrum-core";
import { useCallback, useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { NumberInput } from "../NumberInput";
import { useEditCommand } from '../../hooks/useEditCommand';



export function TimeControls({arrangement}:{arrangement:ArrangementView}): JSX.Element {
  const {timeParams} = arrangement;
  const [, update] = useState({arrangement});
  const edit = useEditCommand();

  useSubscription(timeParams, () => update({arrangement}));

  const pluralBars = timeParams.length > 1;

  const changeTimeSignature = useCallback((event:React.ChangeEvent<HTMLSelectElement>) => {
    const command: Partial<EditCommand_TimeParamsTimeSignature> = {timeParams};
    command.timeSignature = event.target.value;
    switch (event.target.value) {
      case '4/4':
        command.stepResolution = 16;
        command.pulse = '1/4';
        break;
      case '6/8':
        command.stepResolution = 8;
        command.pulse = '3/8';
        break;
      case '5/4':
        command.stepResolution = 8;
        command.pulse = '1/2';
        break;
      case '7/8':
        command.stepResolution = 8;
        command.pulse = '1/2';
        break;
    }

    edit(command as EditCommand_TimeParamsTimeSignature);
  }, []);

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
          setValue={(newValue:string) => edit({timeParams, tempo:Number(newValue)})}
          subscribable={timeParams}
        /> bpm
      </div>
      <div className="time-control">
        <NumberInput
          getValue={() => String(timeParams.length)}
          setValue={(newValue:string) => edit({timeParams, length:Number(newValue)})}
          subscribable={timeParams}
        /> {pluralBars ? 'bars' : 'bar'}
      </div>
    </div>
  );
}
