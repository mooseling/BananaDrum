import { getEventEngine } from 'bananadrum-player';
import { closeAllOverlays } from './components/Overlay.js';

const eventEngine = getEventEngine();

export const KeyboardHandler = {
  init() {
    window.addEventListener('keydown', event => {
      handleKeyDown(event);
    });
  }
}


function handleKeyDown(event:KeyboardEvent): void {
  if (event.key === 'Escape')
    closeAllOverlays();
  if (event.key === ' ') {
    if (eventEngine.state === 'stopped')
      eventEngine.play();
    else
      eventEngine.stop();
    event.preventDefault();
  }
}
