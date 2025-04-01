import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createElement, createContext } from 'react';
import { getAnimationEngine } from './AnimationEngine.js';
import { HistoryController } from "./HistoryController.js";
import { createKeyboardHandler } from "./KeyboardHandler.js";
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { BananaDrumUi } from './types.js';
import { createSelectionManager, SelectionManager } from './SelectionManager.js';
import { createModeManager, ModeManager } from './ModeManager.js';
import { createMouseHandler } from './MouseHandler.js';
import { BananaDrum } from 'bananadrum-core';

export const SelectionManagerContext = createContext<SelectionManager>(null);
export const ModeManagerContext = createContext<ModeManager>(null);
export const BananaDrumContext = createContext<BananaDrum>(null);


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  HistoryController.init();

  const selectionManager = createSelectionManager();
  const modeManager = createModeManager(selectionManager);

  createKeyboardHandler(bananaDrumPlayer.eventEngine, bananaDrumPlayer.bananaDrum, selectionManager, modeManager);
  createMouseHandler(modeManager, selectionManager);

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);
  const root = createRoot(wrapper);

  root.render(
    createElement(StrictMode, {},
      createElement(BananaDrumContext.Provider, {value:bananaDrumPlayer.bananaDrum},
        createElement(SelectionManagerContext.Provider, {value:selectionManager},
          createElement(ModeManagerContext.Provider, {value:modeManager},
            createElement(BananaDrumViewer, {arrangementPlayer: bananaDrumPlayer.arrangementPlayer, animationEngine})
          )
        )
      )
    )
  );

  return {bananaDrumPlayer, wrapper};
}
