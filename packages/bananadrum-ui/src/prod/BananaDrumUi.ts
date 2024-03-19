import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createElement } from 'react';
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
    createElement(
      StrictMode,
      {
        children: createElement(
          BananaDrumViewer,
          {
            arrangementPlayer: bananaDrumPlayer.arrangementPlayer,
            animationEngine
          }
        )
      }
    )
  );

  return {bananaDrumPlayer, wrapper};
}
