import { BananaDrumPlayer, BananaDrumUi } from 'bananadrum-core';
import ReactDOM from 'react-dom';
import React from 'react';
import { HistoryController } from "./HistoryController.js";
import { KeyboardHandler } from "./KeyboardHandler.js";
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  HistoryController.init();
  KeyboardHandler.init();

  ReactDOM.render(
    React.createElement(
      BananaDrumViewer,
      {arrangementPlayer:bananaDrumPlayer.arrangementPlayer}
    ),
    wrapper
  );

  return {bananaDrumPlayer, wrapper};
}