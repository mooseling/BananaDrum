import { BananaDrumPlayer } from 'bananadrum-player';
import ReactDOM from 'react-dom';
import React from 'react';
import { getAnimationEngine } from './AnimationEngine.js';
import { HistoryController } from "./HistoryController.js";
import { KeyboardHandler } from "./KeyboardHandler.js";
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { BananaDrumUi } from './types.js';


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  HistoryController.init();
  KeyboardHandler.init();

  const animationEngine = getAnimationEngine(bananaDrumPlayer.eventEngine);

  ReactDOM.render(
    React.createElement(
      BananaDrumViewer,
      {arrangementPlayer:bananaDrumPlayer.arrangementPlayer, animationEngine}
    ),
    wrapper
  );

  return {bananaDrumPlayer, wrapper};
}