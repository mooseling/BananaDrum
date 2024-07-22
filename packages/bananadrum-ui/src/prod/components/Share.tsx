/* eslint-disable react/no-unescaped-entities */
import { useState, useContext, useCallback } from 'react';
import { getShareLink } from 'bananadrum-core';
import { toggleOverlay } from './Overlay.js';
import { ArrangementPlayerContext } from './arrangement/ArrangementViewer.js';
import { useStateSubscription } from '../hooks/useStateSubscription.js';


const haveNativeSharing = navigator.share !== undefined;
const haveClipboardAccess = navigator.clipboard !== undefined;


export function Share(): JSX.Element {
  const [url, setUrl] = useState('');
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const arrangement = arrangementPlayer.arrangement;

  const close = () => {
    toggleOverlay('share', 'hide');
    setUrl('');
  }

  const showLink = () => setUrl(getShareLink(arrangement));
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
          id="load-button"
          className="push-button"
          onClick={close}
        >Back to my beat!</button>
      </div>
    </div>
  );
}


function ShareOrCopyButton({url}:{url:string}): JSX.Element {
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const arrangement = arrangementPlayer.arrangement;

  const [copyText, setCopyText] = useState('copy');

  const arrangementTitle = useStateSubscription(arrangement, arrangement => arrangement.title);
  const sharedTitle = arrangementTitle ? arrangementTitle + ' - Banana Drum' : 'Banana Drum - Samba Rhythms';

  if (haveNativeSharing) {
    return (
      <button
        className="push-button shiny-link"
        onClick={() => navigator.share({
          url,
          title: sharedTitle
        })}
      >share</button>
    );
  }

  if (haveClipboardAccess) {
    return (
      <button
        className="push-button"
        onClick={
          () => {
            navigator.clipboard.writeText(url).catch(() => {
              setCopyText("That didn't work :(");
              setTimeout(() => setCopyText('copy'), 3000);
            }).then(() => {
              setCopyText('copied!');
              setTimeout(() => setCopyText('copy'), 3000);
            })
          }
        }
      >{copyText}</button>
    );
  }

  return null;
}
