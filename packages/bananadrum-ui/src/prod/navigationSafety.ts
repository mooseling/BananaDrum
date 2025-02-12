import { anyOverlaysAreOpen, closeAllOverlays } from "./components/Overlay";
import { isMobile } from "./isMobile";


let handlingPopState = false;


function attachHandlers() {
  // On mobile, the back button is used for closing overlays, so we need to set that up
  if (isMobile) {
    window.history.pushState({}, ''); // Add a history entry. The back button "pops" this rather than navigating...
    window.addEventListener('popstate', () => { // ... triggering this event
      if (anyOverlaysAreOpen()) {
        closeAllOverlays();
        window.history.pushState({}, ''); // Add back the buffer history entry that the back button just popped
      } else {
        handlingPopState = true;
        window.history.back(); // This will trigger the beforeunload event, which we handle asynchronously
      }
    });
  }

  // Refresh, back, and navigate away: trigger a confirmation box
  // Desktop Safari: Back doesn't trigger this. iOS Safari: Refresh doesn't trigger this
  window.onbeforeunload = event => {
    if (handlingPopState) {
      window.history.pushState({}, '');
      handlingPopState = false;
    }
    event.preventDefault();   // This is the modern way to trigger the dialogue
    event.returnValue = true; // Legacy
    return true;              // Legacy
  };
}


export function initNavigationSafety(getWrapper: () => HTMLElement): ()=>void {
  const wrapper = getWrapper();

  // We wait until the user has made an edit before adding navigation listeners
  // For now we infer this from a click within a wrapper. Inaccurate, but simple for now.
  // According to MDN, there's minor performance benefits to not attaching beforeunload handlers unless necessary
  wrapper.addEventListener('click', attachHandlers, {once: true});

  // Return a method to unmount that click handler
  return () => wrapper.removeEventListener('click', attachHandlers);
}
