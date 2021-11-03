import {useState} from 'react';


export function ArrangementControls({arrangement}:{arrangement:Arrangement}): JSX.Element {
  return (
    <div className="arrangement-controls">
      <TimeControls arrangement={arrangement} />
    </div>
  );
}


function TimeControls({arrangement}:{arrangement:Arrangement}): JSX.Element {
  const {timeParams} = arrangement;
  const [displayTempo, updateDisplayTempo] = useState(String(timeParams.tempo));
  const [state, setState] = useState(0);
  timeParams.subscribe(() => setState(state + 1));

  return (
    <div className="time-controls">
      Tempo: <input time-param="tempo" type="number" onChange={inputTempo} value={displayTempo} onBlur={blurTempo} onKeyPress={keyPressTempo}/> bpm
    </div>
  );

  function inputTempo(event:React.ChangeEvent<HTMLInputElement>) {
    updateDisplayTempo(event.target.value);
  }

  function blurTempo() {
    submitTempo(displayTempo);
  }

  function keyPressTempo(event:React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter')
      submitTempo(displayTempo);
  }

  function submitTempo(newTempo:string):void {
    timeParams.tempo = Number(newTempo);
  }
}
