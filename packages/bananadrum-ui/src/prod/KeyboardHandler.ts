import { EventEngine } from 'bananadrum-player';
import { closeAllOverlays } from './components/Overlay.js';
import { ModeManager } from './ModeManager.js';
import { SelectionManager } from './SelectionManager.js';


export function createKeyboardHandler(eventEngine:EventEngine, selectionManager:SelectionManager, modeManager:ModeManager) {
  window.addEventListener('keydown', event => handleKeyDown(event));
  window.addEventListener('keyup', event => handleKeyUp(event));

  function handleKeyDown(event:KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        closeAllOverlays();
        selectionManager.deselectAll();
        modeManager.deletePolyrhythmMode = false;
        break;
      case ' ':
        if (eventEngine.state === 'stopped')
          eventEngine.play();
        else
          eventEngine.stop();
        event.preventDefault(); // This is to prevent spaces getting written in number inputs
        break;
      case 'Alt':
        modeManager.deletePolyrhythmMode = true;
        event.preventDefault();
        break;
      case 'Backspace':
      case 'Delete':
        if (!(event.target instanceof HTMLInputElement)){
          selectionManager.selections.forEach(({selectedNotes}) => selectedNotes.forEach(note => note.noteStyle = null));
          selectionManager.deselectAll();
        }
    }
  }

  function handleKeyUp(event:KeyboardEvent): void {
    if (event.key === 'Alt')
      modeManager.deletePolyrhythmMode = false;
  }
}
