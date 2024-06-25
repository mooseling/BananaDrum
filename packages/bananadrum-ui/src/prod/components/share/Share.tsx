/* eslint-disable react/no-unescaped-entities */
import { useState, useContext, useCallback } from 'react';
import { serialiseArrangement } from 'bananadrum-core';
import { toggleOverlay } from '../Overlay.js';
import { ArrangementPlayerContext } from '../arrangement/ArrangementViewer.js';
import { ShareOrCopyButton } from './ShareOrCopyButton.js';
import { EditTitle } from './EditTitle.js';
import { useSubscription } from '../../hooks/useSubscription.js';


export function Share(): JSX.Element {
  const arrangementPlayer = useContext(ArrangementPlayerContext);
  const arrangement = arrangementPlayer.arrangement;

  const [serialisedArrangement, setSerialisedArrangement] = useState('');
  const [title, setTitle] = useState(arrangement.title);

  const close = useCallback(() => {
    toggleOverlay('share', 'hide');
    setSerialisedArrangement('');
  }, []);
  const showLink = useCallback(() => setSerialisedArrangement(serialiseArrangement(arrangement)), []);
  const selectContent = useCallback(event => window.getSelection().selectAllChildren(event.currentTarget), []);

  useSubscription(arrangement, () => setTitle(arrangement.title));

  const url = getFullUrl(title, serialisedArrangement);

  return (
    <div className="viewport-wrapper">
      <div id="share" className="welcome">
        <div className="share-content-wrapper">
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
          <p>
            <EditTitle arrangement={arrangement} />
          </p>
        </div>
        <button
          className="push-button"
          onClick={close}
        >Back to my beat!</button>
      </div>
    </div>
  );
}


const urlStart = 'https://bananadrum.net/?';


function getFullUrl(title:string, serialisedArrangement:string): string {
  if (!serialisedArrangement)
    return '';

  if (title)
    return `${urlStart}t=${encodeURIComponent(title)}&a2=${serialisedArrangement}`;

  return `${urlStart}a2=${serialisedArrangement}`;
}
