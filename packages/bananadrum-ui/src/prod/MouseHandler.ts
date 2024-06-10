import { isMobile } from "./isMobile";
import { ModeManager } from "./ModeManager";
import { SelectionManager } from "./SelectionManager";

export function createMouseHandler(modeManager:ModeManager, selectionManager:SelectionManager) {
  if (!isMobile)
    addSelectByMousemoveEvents(modeManager);

  // We want clicking anywhere to clear the selection, with some extra criteria...
  window.addEventListener('click', event => {
    if (
      selectionManager.selections.size
      && !modeManager.selectByMouseOverMode // mouseup might be the end of selecting notes, but will fire a click event
      && !onSelectionButtonsOrPolyrhythmControls(event)
      && !event.shiftKey
    ) {
      selectionManager.deselectAll();
    }
  });
}


function addSelectByMousemoveEvents(modeManager:ModeManager) {
  let startX:number = null;
  let startY:number = null;

  window.addEventListener('mousedown', (event:MouseEvent) => {
    if (event.target instanceof HTMLElement && event.target.closest('.note-viewer')) {
      startX = event.pageX;
      startY = event.pageY;
    }
  });

  // We need to decide when to enter select-by-mouseover mode
  window.addEventListener('mousemove', (event:MouseEvent) => {
    if (
      !modeManager.selectByMouseOverMode // No point if we're already in the mode
      && event.buttons === 1 // Only interested if the user has the primary mouse button down
      && event.target instanceof HTMLElement && event.target.closest('.note-viewer') // ...and if this movement is on a note
      && (
        // Now we check whether the mouse has moved far enough from the mousedown point
        (startX !== null && Math.abs(event.pageX - startX) > 17)
        || (startY !== null && Math.abs(event.pageY - startY) > 17)
      )
    ) {
        modeManager.selectByMouseOverMode = true;

        // Might not be necessary to set these back to null, but seems safer
        startX = null;
        startY = null;
      }
  });

  // When the mousebutton goes back up, we leave select-by-mouseover mode
  window.addEventListener('mouseup', () => {
    // We need to handle click events first, so we setTimeout to delay this reaction
    setTimeout(() => {
      modeManager.selectByMouseOverMode = false;
      startX = null;
      startY = null;
    }, 0)
  });

  // If we don't catch the mouseup because the window defocused, we can still look for a mouseenter
  document.body.addEventListener('mouseenter', (event:MouseEvent) => {
    if (modeManager.selectByMouseOverMode && event.buttons !== 1) {
      // Primary button not held down, so we leave select mode
      modeManager.selectByMouseOverMode = false;
      startX = null;
      startY = null;
    }
  });
}


function onSelectionButtonsOrPolyrhythmControls(event:MouseEvent) {
  if (!(event.target instanceof HTMLElement))
      return false;

  // Anywhere outside the selection-controls overlay is definitely wrong
  const selectionControlsOverlay = event.target.closest('.overlay[data-overlay-name="selection_controls"');
  if (!selectionControlsOverlay)
    return false;

  // Any button inside selection controls is ok
  if (event.target instanceof HTMLButtonElement)
    return true;

  // We allow clicking anywhere in the overlay if we're adding a polyrhythm. It just feels right.
  return selectionControlsOverlay.querySelector('.selection-controls.adding-polyrhythm') !== null;
}
