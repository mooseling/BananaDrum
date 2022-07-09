import {useState, useEffect} from 'react';
import {Publisher} from '../Publisher';


export function Overlay({name, children}:{name:string, children:JSX.Element}): JSX.Element {
  const [visibilityClass, setVisibilityClass] = useState('invisible hidden');

  useEffect(() => {
    const state = OverlayState();
    const overlaySubscription = () => {
      if (state.visible) {
        setVisibilityClass('invisible'); // First remove hidden class, so we remove display:none
        setTimeout(() => setVisibilityClass('visible'), 0); // Then fade in
      } else {
        setVisibilityClass('invisible'); // hidden class will be set after animation ends
      }
    };
    state.subscribe(overlaySubscription);
    overlayStates[name] = state;
    return () => {
      state.unsubscribe(overlaySubscription);
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
    <div className={className} onTransitionEnd={handleTransitionEnd}>
      {children}
    </div>
  );
}


type OverlayState = Banana.Subscribable & {visible:boolean};
function OverlayState(): OverlayState {
  const publisher:Banana.Publisher = Publisher();
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


export function toggleOverlay(name:string, mode:'toggle'|'show'|'hide' = 'toggle') {
  const state = overlayStates[name];
  if (state === undefined) {
    console.warn("Toggled an overlay that wasn't registered");
    return;
  }

  state.visible =
    mode === 'toggle' ? !state.visible :
    mode === 'show' ? true :
    false; // mode === 'hide'
}
