import {EventEngine} from './EventEngine';
import {closeAllOverlays} from './components/Overlay';

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
    if (EventEngine.state === 'stopped' || EventEngine.state == 'paused')
      EventEngine.play();
    else
      EventEngine.pause();
    event.preventDefault();
  }
}