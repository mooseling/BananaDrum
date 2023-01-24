import {getEventEngine} from './EventEngine.js';
import {closeAllOverlays} from './components/Overlay.jsx';

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
