import { useState, useEffect, createContext, useMemo } from 'react';
import { Subscribable } from 'bananadrum-core';
import { createPublisher } from 'bananadrum-core';


export const OverlayStateContext = createContext<OverlayState>(null);


export function Overlay({name, children}:{name:string, children:JSX.Element}): JSX.Element {
  const [visibilityClass, setVisibilityClass] = useState('invisible hidden');
  const overlayState = useMemo(() => createOverlayState(), []);

  useEffect(() => {
    const overlaySubscription = () => {
      if (overlayState.visible) {
        setVisibilityClass('invisible'); // First remove hidden class, so we remove display:none
        setTimeout(() => setVisibilityClass('visible'), 0); // Then fade in
      } else {
        setVisibilityClass('invisible'); // hidden class will be set after animation ends
      }
    };

    overlayState.subscribe(overlaySubscription);
    overlayStates[name] = overlayState;

    return () => {
      overlayState.unsubscribe(overlaySubscription);
      delete overlayStates[name];
    };
  }, []);

  const className = `overlay ${visibilityClass}`;

  function handleTransitionEnd(event:React.SyntheticEvent) {
    const elem = event.target as HTMLElement;

    // Only want to catch the overlay fading
    if (!elem?.classList.contains('overlay'))
      return;

    if (visibilityClass === 'invisible')
      setVisibilityClass('invisible hidden');

    event.stopPropagation(); // Don't want to catch this if we have overlays within overlays... ee gads
  }

  return (
    <OverlayStateContext.Provider value={overlayState}>
      <div className={className} data-overlay-name={name} onTransitionEnd={handleTransitionEnd}>
        {children}
      </div>
    </OverlayStateContext.Provider>
  );
}


type OverlayState = Subscribable & {visible:boolean};
function createOverlayState(): OverlayState {
  const publisher = createPublisher();
  let visible = false;
  return {
    get visible() {return visible;},
    set visible(newVisible) {
      if (visible !== newVisible) {
        visible = newVisible;
        publisher.publish();
      }
    },
    subscribe: publisher.subscribe,
    unsubscribe: publisher.unsubscribe
  };
}


const overlayStates:{[name:string]:OverlayState} = {};


export function toggleOverlay(name:string, mode:'toggle'|'show'|'hide' = 'toggle'): void {
  const state = overlayStates[name];
  if (state === undefined) {
    console.warn("Toggled an overlay that wasn't registered");
    return;
  }

  if (mode === 'show' || (mode === 'toggle' && !state.visible)) {
    closeAllOverlays(name); // Not sure why we do this...
    state.visible = true;
  } else {
    state.visible = false;
  }
}


export function closeAllOverlays(ignoreName?:string): void {
  for (const name in overlayStates) {
    if (!ignoreName || ignoreName !== name)
      overlayStates[name].visible = false;
  }
}


export function anyOverlaysAreOpen(): boolean {
  for (const name in overlayStates) {
    if (overlayStates[name].visible)
      return true;
  }
  return false;
}
