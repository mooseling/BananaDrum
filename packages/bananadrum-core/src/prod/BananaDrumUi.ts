import { BananaDrumPlayer, BananaDrumUi } from "./types";
import ReactDOM from 'react-dom';
import React from 'react';
import { HistoryController } from "./HistoryController";
import { KeyboardHandler } from "./KeyboardHandler";
import { BananaDrumViewer } from "./components/BananaDrumViewer";


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