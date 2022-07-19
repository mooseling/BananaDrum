import {EventEngine} from './EventEngine';
import {closeAllOverlays} from './components/Overlay';

export const KeyboardHandler = {
  init() {
    window.addEventListener('keypress', event => {
      handleKeyPress(event);
    });
    window.addEventListener('keydown', event => {
      handleKeyDown(event);
    });
  }
}


function handleKeyPress(event:KeyboardEvent): void {
  if (isInInput(event))
    return;
  if (event.key === ' ') {
    if (EventEngine.state === 'stopped' || EventEngine.state == 'paused')
      EventEngine.play();
    else
      EventEngine.pause();
    event.preventDefault();
  }
}


function handleKeyDown(event:KeyboardEvent): void {
  if (isInInput(event))
    return;
  if (event.key === 'Escape')
    closeAllOverlays();
}


function isInInput(event:KeyboardEvent): boolean {
  const element = event.target;
  if (element instanceof HTMLElement) {
    const tagName = element.tagName;
    return (tagName === 'INPUT' || tagName === 'TEXTAREA')
  }
  return false;
}
