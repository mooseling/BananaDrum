import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createElement, createContext } from 'react';
import { getAnimationEngine } from './AnimationEngine.js';
import { HistoryController } from "./HistoryController.js";
import { createKeyboardHandler } from "./KeyboardHandler.js";
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { BananaDrumUi } from './types.js';
import { createSelectionManager, SelectionManager } from './SelectionManager.js';

export const SelectionManagerContext = createContext<SelectionManager>(null);


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  HistoryController.init();

  const selectionManager = createSelectionManager();

  createKeyboardHandler(bananaDrumPlayer.eventEngine, selectionManager);

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);
  const root = createRoot(wrapper);

  root.render(
    createElement(StrictMode, {},
      createElement(SelectionManagerContext.Provider, {value:selectionManager},
        createElement(BananaDrumViewer, {arrangementPlayer: bananaDrumPlayer.arrangementPlayer, animationEngine})
      )
    )
  );

  return {bananaDrumPlayer, wrapper};
}
