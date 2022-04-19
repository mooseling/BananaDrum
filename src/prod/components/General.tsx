import {useState} from 'react';

export function NumberInput(
  {getValue, setValue}:{getValue:() => string, setValue:(newValue:string) => void}
): JSX.Element {
  const [visibleValue, setVisibleValue] = useState(getValue());

  function attemptSet() {
    try {
      setValue(visibleValue);
    } catch(e) {
      setVisibleValue(getValue());
    }
  }

  return (
    <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    onChange={event => setVisibleValue(event.target.value)}
    value={visibleValue}
    onBlur={() => attemptSet()}
    onKeyPress={event => event.key === 'Enter' && attemptSet()}
    />
  );
}
