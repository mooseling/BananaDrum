import { useState } from "react";


const haveNativeSharing = navigator.share !== undefined;
const haveClipboardAccess = navigator.clipboard !== undefined;

export function ShareOrCopyButton({url}:{url:string}): JSX.Element {
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

  return null;
}
