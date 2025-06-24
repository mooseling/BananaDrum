import { BananaDrumPlayer } from 'bananadrum-player';
import { ArrangementViewer } from './arrangement/ArrangementViewer.js';
import { Overlay, toggleOverlay } from './Overlay.js';
import { createContext } from 'react';
import { About } from './About.js';
import { BananaDrumUiServices } from '../BananaDrumUi.js';
import { BananaDrum } from 'bananadrum-core';


export const ServicesContext = createContext<BananaDrumUiServices>(null);
export const BananaDrumContext = createContext<BananaDrum>(null)


export function BananaDrumViewer({bananaDrumPlayer, services}:{bananaDrumPlayer:BananaDrumPlayer, services:BananaDrumUiServices}): JSX.Element {
  return (
    <div id="banana-drum" className="overlay-wrapper">
      <BananaDrumContext.Provider value={bananaDrumPlayer.bananaDrum}>
      <ServicesContext.Provider value={services}>
        <ArrangementViewer arrangementPlayer={bananaDrumPlayer.arrangementPlayer}/>
        <div id="footer">
          <button className="anchor-button" onClick={() => toggleOverlay('about', 'show')}>About</button>
        </div>
        <Overlay name="about">
          <About />
        </Overlay>
      </ServicesContext.Provider>
      </BananaDrumContext.Provider>
    </div>
  );
}
