import { Arrangement } from "bananadrum-core";
import { useCallback, useState } from "react";
import { useOverlayState } from "../../hooks/useOverlayState";
import { useSubscription } from "../../hooks/useSubscription";

export function EditTitle({arrangement}:{arrangement:Arrangement}): JSX.Element {
  const [inputIsVisible, setInputIsVisible] = useState(!!arrangement.title);

  const revealInput = useCallback(() => setInputIsVisible(true), []);

  // When the overlay closes, we want to reset the component. So we hide the input if there's no title.
  useOverlayState({
    onClose: () => setInputIsVisible(!!arrangement.title)
  });

  const [inputValue, setInputValue] = useState(arrangement.title || '');
  useSubscription(arrangement, () => setInputValue(arrangement.title || ''));

  return inputIsVisible
      ? (<>
        Title: <input
          type="text"
          className="long"
          onChange={e => arrangement.title = e.target.value}
          onKeyDown={e => e.stopPropagation()} // Don't want to trigger global keyboard handlers, like play-on-spacebar
          value={inputValue}
          />
      </>)
      : (<button
          className="push-button"
          onClick={revealInput}
        >Add a title?</button>);
}
