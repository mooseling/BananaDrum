import {useState, useEffect} from 'react';


export function ArrangementControls({arrangement}:{arrangement:Banana.Arrangement}): JSX.Element {
  return (
    <div className="arrangement-controls">
      <TimeControls arrangement={arrangement} />
    </div>
  );
}


function TimeControls({arrangement}:{arrangement:Banana.Arrangement}): JSX.Element {
  const {timeParams} = arrangement;
  const [displayTempo, updateDisplayTempo] = useState(String(timeParams.tempo));
  const [displayLength, updateDisplayLength] = useState(String(timeParams.length));
  let [state, update] = useState({arrangement});
  useEffect(() => timeParams.subscribe(() => update({arrangement})), []);

  return (
    <div className="time-controls">
      Tempo: <input time-param="tempo" type="number" onChange={inputTempo} value={displayTempo} onBlur={blurTempo} onKeyPress={keyPressTempo}/> bpm<br/>
      Length: <input time-param="length" type="number" onChange={inputLength} value={displayLength} onBlur={blurLength} onKeyPress={keyPressLength}/> bars
    </div>
  );

  // Tempo functions
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
    try {
      timeParams.tempo = Number(newTempo);
    } catch (e) {
      updateDisplayTempo(String(timeParams.tempo));
    }
  }

  // Length functions
  function inputLength(event:React.ChangeEvent<HTMLInputElement>) {
    updateDisplayLength(event.target.value);
  }

  function blurLength() {
    submitLength(displayLength);
  }

  function keyPressLength(event:React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter')
      submitLength(displayLength);
  }

  function submitLength(newLength:string):void {
    try {
      timeParams.length = Number(newLength);
    } catch (e) {
      updateDisplayLength(String(timeParams.length));
    }
  }
}
