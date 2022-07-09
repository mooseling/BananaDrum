import {useState, useContext} from 'react';
import {toggleOverlay} from './Overlay';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {getShareLink} from '../compression';


export function Share(): JSX.Element {
  const [url, setUrl] = useState('');
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const arrangement = arrangementPlayer.arrangement;

  const close = () => {
    toggleOverlay('share', 'hide');
    setUrl('');
  }

  const showLink = () => setUrl(getShareLink(arrangement))

  return (
    <div id="share" className="welcome">
      <div className="share-content-wrapper">
        { url ?
          (<>
            <h2>Your beat has been compressed into this:</h2>
            <h1>{url}</h1>
            <p>Send it to your friends, save it somewhere for yourself, or post it on our <a href="https://www.facebook.com/Banana-Drum-108081858593069" target="_blank">Facebook page</a>!</p>
          </>) :
          (<>
            <h2>Ready to share this beat?</h2>
            <button className="push-button shiny-link" onClick={showLink}>generate link!</button>
            <p>You can also use this to save your work</p>
          </>)
        }
      </div>
      <button
        id="load-button"
        className="push-button"
        onClick={close}
      >Back to my beat!</button>
    </div>
  );
}
