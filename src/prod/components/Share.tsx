import {useState, useContext} from 'react';
import {toggleOverlay} from './Overlay';
import {ArrangementPlayerContext} from './ArrangementViewer';
import {getShareLink} from '../compression';


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

  const showLink = () => setUrl(getShareLink(arrangement))

  return (
    <div className="viewport-wrapper">
      <div id="share" className="welcome">
        <div className="share-content-wrapper">
          { url ?
            (<>
              <h2>Here's your beat:</h2>
              <div className="beat-url">
                <p onClick={event => window.getSelection().selectAllChildren(event.currentTarget)}>{url}</p>
                <ShareOrCopyButton url={url}/>
                </div>
              <p>Send it to your friends, save it for yourself, or post it on our <a href="https://www.facebook.com/Banana-Drum-108081858593069" target="_blank">Facebook page</a>!</p>
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
    </div>
  );
}


function ShareOrCopyButton({url}:{url:string}): JSX.Element {
  const [copyText, setCopyText] = useState('copy');

  if (haveNativeSharing) {
    return (
      <button
        className="push-button shiny-link"
        onClick={() => navigator.share({
          url,
          title:'Banana Drum - Samba Rhythms'
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
}
