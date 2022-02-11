import {ArrangementViewer} from './ArrangementViewer';
import {Overlay, OverlayState} from './Overlay';
import {useState} from 'react';

export function BananaDrum({arrangementPlayer}:{arrangementPlayer:Banana.ArrangementPlayer}): JSX.Element {
  const [overlayState] = useState(OverlayState(false));

  return (
    <div id="banana-drum" className="overlay-wrapper">
      <ArrangementViewer arrangementPlayer={arrangementPlayer}/>
      <Footer aboutState={overlayState}/>
      <Overlay state={overlayState}>
        <About overlayState={overlayState}/>
      </Overlay>
    </div>
  );
}


function Footer({aboutState}:{aboutState:Banana.OverlayState}): JSX.Element {
  return (
    <div id="footer">
      <button className="anchor-button" onClick={() => aboutState.visible || aboutState.toggle()}>About</button>
    </div>
  );
}


function About({overlayState}:{overlayState:Banana.OverlayState}): JSX.Element {
  return (
    <div id="about" className="welcome">
      <img src="images/banana-with-feet.svg" style={{height:"80pt"}}/>
      <h1>Welcome to Banana Drum!</h1>
      <p>Banana Drum is currently just a drum sequencer, but one day soon it will be an amazing drum sequencer for samba bands! It will have all the drums of the bateria, and it will be easy for anyone to compose songs, grooves, and breaks, and to share them with their bands.</p>
      <p>
        <a target="_blank" href="https://jamofalltrades.com">Check out the author</a>
        <br/>
        <a target="_blank" href="https://github.com/mooseling/BananaDrum">Check out the code</a>
        <br/>
        <a target="_blank" href="https://trello.com/b/f6731Frf/bananadrum">Check on progress</a>
      </p>
      <button id="load-button" className="push-button" onClick={() => overlayState.toggle()}>Back to my beat!</button>
    </div>
  );
}
