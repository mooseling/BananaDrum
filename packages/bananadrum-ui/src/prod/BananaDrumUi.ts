import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createElement } from 'react';
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { AnimationEngine, BananaDrumUi } from './types.js';
import { getAnimationEngine } from './AnimationEngine.js';
import { createKeyboardHandler } from './KeyboardHandler.js';
import { createModeManager, ModeManager } from './ModeManager.js';
import { createMouseHandler } from './MouseHandler.js';
import { createSelectionManager, SelectionManager } from './SelectionManager.js';
import { initSessionRecovery } from './session-recovery.js';


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  const services = initServices(bananaDrumPlayer)

  createRoot(wrapper).render(
    createElement(StrictMode, {},
      createElement(BananaDrumViewer, {bananaDrumPlayer, services})
    )
  );

  return {bananaDrumPlayer, wrapper};
}


export interface BananaDrumUiServices {
  animationEngine: AnimationEngine
  selectionManager: SelectionManager
  modeManager: ModeManager
}


function initServices(bananaDrumPlayer:BananaDrumPlayer): BananaDrumUiServices {

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);
  const selectionManager = createSelectionManager();
  const modeManager = createModeManager(selectionManager);

  createKeyboardHandler(bananaDrumPlayer.eventEngine, bananaDrumPlayer.bananaDrum, selectionManager, modeManager);
  createMouseHandler(modeManager, selectionManager);
  initSessionRecovery(bananaDrumPlayer.bananaDrum);

  return {animationEngine, selectionManager, modeManager}
}
