import { toggleOverlay } from './Overlay.js';

export function ShareButton(): JSX.Element {
  return (
    <button id="share-button" className="push-button" onClick={() => toggleOverlay('share', 'show')}>
      <span>Share this beat!</span>
      <img style={{width:'18pt', height:'18pt'}} src="/images/icons/paper_plane_white.svg" />
    </button>
  );
}
