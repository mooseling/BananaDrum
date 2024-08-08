import { ArrangementPlayer } from 'bananadrum-player';
import { ArrangementViewer } from './arrangement/ArrangementViewer.js';
import { Overlay, toggleOverlay } from './Overlay.js';
import { createContext } from 'react';
import { About } from './About.js';

export const AnimationEngineContext = createContext(null);

export function BananaDrumViewer({arrangementPlayer,}:{arrangementPlayer:ArrangementPlayer}): JSX.Element {

  return (
    <div id="banana-drum" className="overlay-wrapper">
        <ArrangementViewer arrangementPlayer={arrangementPlayer}/>
        <div id="footer">
          <button className="anchor-button" onClick={() => toggleOverlay('about', 'show')}>About</button>
        </div>
        <Overlay name="about">
          <About />
        </Overlay>
    </div>
  );
}
