import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createContext } from 'react';
import { getAnimationEngine } from './AnimationEngine.js';
import { createKeyboardHandler } from "./KeyboardHandler.js";
import { AnimationEngineContext, BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { BananaDrumUi } from './types.js';
import { createSelectionManager, SelectionManager } from './SelectionManager.js';
import { createModeManager, ModeManager } from './ModeManager.js';
import { createMouseHandler } from './MouseHandler.js';

export const SelectionManagerContext = createContext<SelectionManager>(null);
export const ModeManagerContext = createContext<ModeManager>(null);


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  const selectionManager = createSelectionManager();
  const modeManager = createModeManager(selectionManager);

  createKeyboardHandler(bananaDrumPlayer.eventEngine, selectionManager, modeManager);
  createMouseHandler(modeManager, selectionManager);

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);
  const root = createRoot(wrapper);

  root.render(
    <StrictMode>
      <SelectionManagerContext.Provider value={selectionManager}>
      <ModeManagerContext.Provider value={modeManager}>
      <AnimationEngineContext.Provider value={animationEngine}>
        <BananaDrumViewer arrangementPlayer={bananaDrumPlayer.arrangementPlayer} />
      </AnimationEngineContext.Provider>
      </ModeManagerContext.Provider>
      </SelectionManagerContext.Provider>
    </StrictMode>
  );

  return {bananaDrumPlayer, wrapper};
}
