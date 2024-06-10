/* eslint-disable react/no-unescaped-entities */
import { useState, useContext, useCallback } from 'react';
import { getShareLink } from 'bananadrum-core';
import { toggleOverlay } from '../Overlay.js';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer.js';
import { ShareOrCopyButton } from './ShareOrCopyButton.js';


export function Share(): JSX.Element {
  const [url, setUrl] = useState('');
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const arrangement = arrangementPlayer.arrangement;

  const close = useCallback(() => {
    toggleOverlay('share', 'hide');
    setUrl('');
  }, []);
  const showLink = useCallback(() => setUrl(getShareLink(arrangement)), []);
  const selectContent = useCallback(event => window.getSelection().selectAllChildren(event.currentTarget), []);

  return (
    <div className="viewport-wrapper">
      <div id="share" className="welcome">
        <div className="share-content-wrapper">
          <>
            { url ?
              (<>
                <h2>Here's your beat:</h2>
                <div className="beat-url">
                  <p onClick={selectContent}>{url}</p>
                  <ShareOrCopyButton url={url}/>
                  </div>
              </>) :
              (<>
                <h2>Ready to share this beat?</h2>
                <button className="push-button shiny-link" onClick={showLink}>generate link!</button>
              </>)
            }
            <p>Send to your friends, save for yourself, or post it on <a href="https://www.facebook.com/bananadrum.net" target="_blank" rel="noreferrer">Banana Drum's Facebook page</a>!</p>
          </>
        </div>
        <button
          className="push-button"
          onClick={close}
        >Back to my beat!</button>
      </div>
    </div>
  );
}
