import { EventEngine } from 'bananadrum-player';
import { anyOverlaysAreOpen, closeAllOverlays } from './components/Overlay.js';
import { SelectionManager } from './SelectionManager.js';


export function createKeyboardHandler(eventEngine:EventEngine, selectionManager:SelectionManager) {
  window.addEventListener('keydown', event => {
    handleKeyDown(event);
  });

  function handleKeyDown(event:KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (anyOverlaysAreOpen())
        closeAllOverlays();
      else
        selectionManager.clearSelection();
    } else if (event.key === ' ') {
      if (eventEngine.state === 'stopped')
        eventEngine.play();
      else
        eventEngine.stop();
      event.preventDefault();
    }
  }
}
