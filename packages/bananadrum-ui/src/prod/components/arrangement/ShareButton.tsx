import { toggleOverlay } from '../overlay/Overlay.js';
import * as styles from './style.module.css'

export function ShareButton(): JSX.Element {
  return (
    <button id={styles.shareButton} className="push-button" onClick={() => toggleOverlay('share', 'show')}>
      <span>Share this beat!</span>
      <img style={{width:'18pt', height:'18pt'}} src="/images/icons/paper_plane_white.svg" />
    </button>
  );
}
