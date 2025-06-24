import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createElement } from 'react';
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { AnimationEngine, BananaDrumUi } from './types.js';
import { getAnimationEngine } from './AnimationEngine.js';
import { HistoryController } from './HistoryController.js';
import { createKeyboardHandler } from './KeyboardHandler.js';
import { createModeManager, ModeManager } from './ModeManager.js';
import { createMouseHandler } from './MouseHandler.js';
import { createSelectionManager, SelectionManager } from './SelectionManager.js';


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  const services = instantiateServices(bananaDrumPlayer)

  createRoot(wrapper).render(
    createElement(StrictMode, {},
      // There used to be lots of context providers here, but they are in <BananaDrumViewer> now
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


function instantiateServices(bananaDrumPlayer:BananaDrumPlayer): BananaDrumUiServices {
  HistoryController.init();
  
  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);
  const selectionManager = createSelectionManager();
  const modeManager = createModeManager(selectionManager);

  createKeyboardHandler(bananaDrumPlayer.eventEngine, bananaDrumPlayer.bananaDrum, selectionManager, modeManager);
  createMouseHandler(modeManager, selectionManager);

  return {animationEngine, selectionManager, modeManager}
}
