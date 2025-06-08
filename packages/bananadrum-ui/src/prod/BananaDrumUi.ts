import { BananaDrumPlayer } from 'bananadrum-player';
import { createRoot } from 'react-dom/client';
import { StrictMode, createElement } from 'react';
import { BananaDrumViewer } from "./components/BananaDrumViewer.js";
import { BananaDrumUi } from './types.js';


export function createBananaDrumUi(bananaDrumPlayer:BananaDrumPlayer, wrapper:HTMLElement): BananaDrumUi {
  const root = createRoot(wrapper);

  root.render(
    createElement(StrictMode, {},
      // There used to be lots of context providers here, but they are in <BananaDrumViewer> now
      createElement(BananaDrumViewer, {bananaDrumPlayer})
    )
  );

  return {bananaDrumPlayer, wrapper};
}
