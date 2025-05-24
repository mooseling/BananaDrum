import { Subscribable } from 'bananadrum-core';
import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription.js';

export function NumberInput(
  {getValue, setValue, subscribable}:{getValue:() => string, setValue:(newValue:string) => void, subscribable:Subscribable}
): JSX.Element {
  const [visibleValue, setVisibleValue] = useState(getValue());

  // If the model pushes a change to this value for some other reason, we'd better update
  useSubscription(subscribable, () => setVisibleValue(getValue()));

  // To update the input as you type, but not update the model
  function attemptSetVisibleValue(inputValue:string) {
    if (inputValue.length === 0)
      return setVisibleValue('');

    if (!inputValue.charAt(inputValue.length - 1).match(/[0-9]/))
      return attemptSetVisibleValue(inputValue.substring(0, inputValue.length - 1));

    setVisibleValue(inputValue);
  }

  // Try to set the model value, which may fail due to validation
  function attemptSet() {
    if (visibleValue === getValue())
      return;

    try {
      setValue(visibleValue);
    } catch(e) {
      setVisibleValue(getValue());
    }
  }

  return (
    <input
    className="short"
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    onChange={event => attemptSetVisibleValue(event.target.value)}
    value={visibleValue}
    onBlur={() => attemptSet()}
    onKeyPress={event => event.key === 'Enter' && attemptSet()}
    />
  );
}
