import { useContext, useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription.js';
import { TrackPlayerContext } from './TrackViewer.js';


const smButtonClasses = 'options-button push-button small solo-mute-button';


export function SoloMuteButtons(): JSX.Element {
  const trackPlayer = useContext(TrackPlayerContext);
  const [soloed, setSoloed] = useState(trackPlayer.soloMute === 'solo');
  const [muted, setMuted] = useState(trackPlayer.soloMute === 'mute');

  useSubscription(trackPlayer, () => {
    setSoloed(trackPlayer.soloMute === 'solo');
    setMuted(trackPlayer.soloMute === 'mute');
  })

  const solo = () => trackPlayer.soloMute = (trackPlayer.soloMute === 'solo' ? null : 'solo');
  const mute = () => trackPlayer.soloMute = (trackPlayer.soloMute === 'mute' ? null : 'mute');
  const soloButtonColour = soloed ? 'lighter-green' : 'gray';
  const muteButtonColour = muted ? 'dark-blue' : 'gray';


  return (
    <>
      <button className={`${smButtonClasses} ${soloButtonColour}`} onClick={solo}>
        S
      </button>
      <button className={`${smButtonClasses} ${muteButtonColour}`} onClick={mute}>
        M
      </button>
    </>
  );
}