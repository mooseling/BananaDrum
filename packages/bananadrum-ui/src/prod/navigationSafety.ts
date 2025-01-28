import { anyOverlaysAreOpen, closeAllOverlays } from "./components/Overlay";
import { isMobile } from "./isMobile";


export function initNavigationSafety(getWrapper: () => HTMLElement): ()=>void {
  const wrapper = getWrapper();

  const attachHandlers = () => {
    // On mobile, the back button is used for closing overlays, so we need to set that up
    if (isMobile) {
      window.history.pushState({}, ''); // Add a history entry. The back button pops this, triggering an event
      window.addEventListener('popstate', handlePopState);
    }

    // Trigger a confirmation box on refresh (No support on Safari)
    window.onbeforeunload = event => {
      event.preventDefault();
      event.returnValue = true; // Legacy support
      return true; // Legacy support
    };
  };

  // We wait until the user has made an edit before adding navigation listeners
  // For now we infer this from a click within a wrapper. Inaccurate, but simple for now.
  // According to MDN, there's minor performance benefits to not attaching beforeunload handlers unless necessary
  wrapper.addEventListener('click', attachHandlers, {once: true});

  // Return a method to unmount that click handler
  return () => wrapper.removeEventListener('click', attachHandlers);
}


// Popstate event happens after a history state has been popped
function handlePopState() {
  if (anyOverlaysAreOpen()) {
    closeAllOverlays();
    window.history.pushState({}, ''); // Add back the buffer history entry that the back button just popped
  } else {
    window.history.back(); // This will trigger the beforeunload event, which we handle separately
    window.history.pushState({}, ''); // If we've gotten this far, the user cancelled navigating back
  }
}
