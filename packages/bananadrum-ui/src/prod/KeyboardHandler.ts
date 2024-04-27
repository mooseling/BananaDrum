import { EventEngine } from 'bananadrum-player';
import { closeAllOverlays } from './components/Overlay.js';
import { ModeManager } from './ModeManager.js';
import { SelectionManager } from './SelectionManager.js';


export function createKeyboardHandler(eventEngine:EventEngine, selectionManager:SelectionManager, modeManager:ModeManager) {
  window.addEventListener('keydown', event => handleKeyDown(event));
  window.addEventListener('keyup', event => handleKeyUp(event));

  function handleKeyDown(event:KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeAllOverlays();
      selectionManager.clearSelection();
    } else if (event.key === ' ') {
      if (eventEngine.state === 'stopped')
        eventEngine.play();
      else
        eventEngine.stop();
      event.preventDefault();
    } else if (event.key === 'Alt') {
      modeManager.deletePolyrhythmMode = true;
      event.preventDefault();
    }
  }

  function handleKeyUp(event:KeyboardEvent): void {
    if (event.key === 'Alt')
      modeManager.deletePolyrhythmMode = false;
  }
}
