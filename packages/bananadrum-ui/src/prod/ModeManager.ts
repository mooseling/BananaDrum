import { createPublisher, Subscribable } from "bananadrum-core";
import { SelectionManager } from "./SelectionManager";

export interface ModeManager extends Subscribable {
  deletePolyrhythmMode: boolean
  mobileSelectionMode: boolean
}

// The really useful thing about a mode-manager would be the ability enforce mutual exclusivity of different modes
// We can avoid UI bugs just by having delete-polyrhythm-mode and select-mode never simultaneous
// All selection controls would appear/disappear based on mode.
// There could be a select-mode cleanup function, so if we change mode, we deselect all
// It introduces a single-source-of-truth problem, as modeManager.selectMode is equivalent to selectionManager.selections.size
// For now, since there's only two modes, not a priority. We just have to be meticulous about avoioding bugs.

export function createModeManager(selectionManager:SelectionManager): ModeManager {
  const publisher = createPublisher();
  let deletePolyrhythmMode = false;
  let mobileSelectionMode = false;

  const modeManager = {
    get deletePolyrhythmMode() {
      return deletePolyrhythmMode;
    },
    set deletePolyrhythmMode(newValue:boolean) {
      if (newValue !== deletePolyrhythmMode) {
        deletePolyrhythmMode = newValue;
        publisher.publish();
      }
    },
    get mobileSelectionMode() {
      return mobileSelectionMode;
    },
    set mobileSelectionMode(newValue:boolean) {
      if (newValue !== mobileSelectionMode) {
        mobileSelectionMode = newValue;
        publisher.publish();
      }
    },
    subscribe: publisher.subscribe,
    unsubscribe: publisher.unsubscribe
  };

  selectionManager.subscribe(() => {
    if (selectionManager.selections.size)
      modeManager.deletePolyrhythmMode = false;
    else
      modeManager.mobileSelectionMode = false;
  });

  return modeManager;
}
