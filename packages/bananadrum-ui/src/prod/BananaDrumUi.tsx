import { BananaDrumPlayer } from 'bananadrum-player';
import {createRoot} from 'react-dom/client';
import { StrictMode } from 'react';
import { getAnimationEngine } from './AnimationEngine.js';
import { HistoryController } from "./HistoryController.js";
import { KeyboardHandler } from "./KeyboardHandler.js";
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { BananaDrumUi } from './types.js';


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  HistoryController.init();
  KeyboardHandler.init();

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);
  const root = createRoot(wrapper);

  root.render(
    <StrictMode>
      <BananaDrumViewer arrangementPlayer={bananaDrumPlayer.arrangementPlayer} animationEngine={animationEngine} />
    </StrictMode>
  );

  return {bananaDrumPlayer, wrapper};
}
