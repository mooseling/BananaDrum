import {useState, useEffect} from 'react';
import {Publisher} from '../Publisher';

export function Overlay({state, children}:{state:Banana.OverlayState, children:JSX.Element}): JSX.Element {
  const [visibilityClass, setVisibilityClass] = useState(state.visible ? 'visible' : 'invisible hidden');
  const overlaySubscription = () => {
    if (state.visible) {
      // If we remove
      setVisibilityClass('invisible'); // First remove hidden class, so we remove display:none
      setTimeout(() => setVisibilityClass('visible'), 0); // Then fade in
    } else {
      setVisibilityClass('invisible'); // hidden class will be set after animation ends
    }
  }; // .hidden will be set after transition
  useEffect(() => {
    state.subscribe(overlaySubscription);
    return () => state.unsubscribe(overlaySubscription);
  }, []);

  const className = `overlay ${visibilityClass}`;

  function handleTransitionEnd(event:React.SyntheticEvent) {
    const elem = event.target as HTMLElement;

    // Only want to catch the overlay fading
    if (!elem?.classList.contains('overlay'))
      return;

    if (!state.visible)
      setVisibilityClass('invisible hidden');
    event.stopPropagation(); // Don't want to catch this if we have overlays within overlays... ee gads
  }

  return (
    <div className={className} onTransitionEnd={handleTransitionEnd}>
      {children}
    </div>
  );
}


export function OverlayState(initialVisible:boolean): Banana.OverlayState {
  const publisher:Banana.Publisher = Publisher();
  return Object.assign(publisher, {
    visible: initialVisible,
    toggle: function() {
      this.visible = !this.visible;
      this.publish();
    }
  })
}
