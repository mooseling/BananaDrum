import { BananaDrumPlayer } from 'bananadrum-player';
import { ArrangementViewer } from './arrangement/ArrangementViewer.js';
import { Overlay, toggleOverlay } from './Overlay.js';
import { createContext } from 'react';
import { About } from './About.js';
import { HistoryController } from '../HistoryController.js';
import { createSelectionManager, SelectionManager } from '../SelectionManager.js';
import { createModeManager, ModeManager } from '../ModeManager.js';
import { BananaDrum } from 'bananadrum-core';
import { getAnimationEngine } from '../AnimationEngine.js';
import { createKeyboardHandler } from '../KeyboardHandler.js';
import { createMouseHandler } from '../MouseHandler.js';
import { AnimationEngine } from '../types.js';


export const AnimationEngineContext = createContext<AnimationEngine>(null);
export const SelectionManagerContext = createContext<SelectionManager>(null);
export const ModeManagerContext = createContext<ModeManager>(null);
export const BananaDrumContext = createContext<BananaDrum>(null);


export function BananaDrumViewer({bananaDrumPlayer}:{bananaDrumPlayer:BananaDrumPlayer}): JSX.Element {
  HistoryController.init();

  const selectionManager = createSelectionManager();
  const modeManager = createModeManager(selectionManager);

  createKeyboardHandler(bananaDrumPlayer.eventEngine, bananaDrumPlayer.bananaDrum, selectionManager, modeManager);
  createMouseHandler(modeManager, selectionManager);

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);

  return (
    <div id="banana-drum" className="overlay-wrapper">
      <BananaDrumContext.Provider value={bananaDrumPlayer.bananaDrum}>
      <SelectionManagerContext.Provider value={selectionManager}>
      <ModeManagerContext.Provider value={modeManager}>
      <AnimationEngineContext.Provider value={animationEngine}>
        <ArrangementViewer arrangementPlayer={bananaDrumPlayer.arrangementPlayer}/>
        <div id="footer">
          <button className="anchor-button" onClick={() => toggleOverlay('about', 'show')}>About</button>
        </div>
        <Overlay name="about">
          <About />
        </Overlay>
      </AnimationEngineContext.Provider>
      </ModeManagerContext.Provider>
      </SelectionManagerContext.Provider>
      </BananaDrumContext.Provider>
    </div>
  );
}
