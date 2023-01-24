import {isMobile} from './isMobile';
import {anyOverlaysAreOpen, closeAllOverlays} from './components/Overlay';

export const HistoryController = {
  init() {
    addBufferState();
    let readyToLeave = false;
    window.addEventListener('popstate', () => {
      // Mobile back button is a natural button for closing overlays
      if (isMobile && anyOverlaysAreOpen()) {
        closeAllOverlays();
        addBufferState();
      } else if (!readyToLeave) {
        if (confirm('You pressed the back button. Leave Banana Drum?')) {
          readyToLeave = true; // Need to set this because back() trigger this again
          window.history.back();
        } else {
          addBufferState();
        }
      }
    });
  }
}


function addBufferState() {
  window.history.pushState({}, '');
}
