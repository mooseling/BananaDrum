import { errorLog } from 'bananadrum-core';
import { ArrangementPlayer } from 'bananadrum-player';
import { ArrangementViewer } from './arrangement/ArrangementViewer.js';
import { Overlay, toggleOverlay } from './Overlay.js';
import { AnimationEngine } from '../types.js';
import { createContext, useState } from 'react';
import { useSubscription } from '../hooks/useSubscription.js';

export const AnimationEngineContext = createContext(null);

export function BananaDrumViewer(
  {arrangementPlayer, animationEngine}:{arrangementPlayer:ArrangementPlayer, animationEngine:AnimationEngine}): JSX.Element {

  return (
    <div id="banana-drum" className="overlay-wrapper">
      <AnimationEngineContext.Provider value={animationEngine}>
        <ArrangementViewer arrangementPlayer={arrangementPlayer}/>
        <Footer />
        <Overlay name="about">
          <About />
        </Overlay>
      </AnimationEngineContext.Provider>
    </div>
  );
}


function Footer(): JSX.Element {
  return (
    <div id="footer">
      <button className="anchor-button" onClick={() => toggleOverlay('about', 'show')}>About</button>
    </div>
  );
}


function About(): JSX.Element {
  const [errorCount, setErrorCount] = useState(errorLog.getEntryCount());
  const errorButtonVisibilityClass = errorCount ? '' : 'hidden';
  const [errorReportIsVisibile, setErrorReportIsVisibile] = useState(false);

  useSubscription(errorLog, () => setErrorCount(errorLog.getEntryCount()));

  return (
    <div className="viewport-wrapper">
      <div id="about" className="welcome">
        <img src="images/banana-with-feet.svg" style={{height:"80pt"}}/>
        <h1>Welcome to Banana Drum!</h1>
        <p>On your lap or in your pocket, an easy way to compose and share samba grooves</p>
        <p>Send feedback and rhythms to <a target="_blank" href="https://www.facebook.com/bananadrum.net" rel="noreferrer">Banana Drum on Facebook</a>!</p>
        <p>
          <a target="_blank" href="https://jamofalltrades.com" rel="noreferrer">Check out the author</a>
          <br/>
          <a target="_blank" href="https://github.com/mooseling/BananaDrum" rel="noreferrer">Check out the code</a>
          <br/>
          <a target="_blank" href="https://trello.com/b/f6731Frf/bananadrum" rel="noreferrer">Check on progress</a>
        </p>
        <div className={errorButtonVisibilityClass}>
          <button
            id="report-error"
            className='push-button'
            onClick={() => setErrorReportIsVisibile(true)}
          >There were errors! Click to view error report.</button>
          <br/><br/>
          <div className={`display-linebreak ${errorReportIsVisibile ? '' : 'hidden'}`}>
            <p>{errorLog.getMessage()}</p>
            <br/>
          </div>
        </div>
        <button
          id="load-button"
          className="push-button"
          onClick={() => {
            toggleOverlay('about', 'hide');
            setErrorReportIsVisibile(false);
          }}
        >Back to my beat!</button>
      </div>
    </div>
  );
}
