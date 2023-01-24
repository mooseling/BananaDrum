import {toggleOverlay} from './Overlay.jsx';

export function ShareButton(): JSX.Element {
  return (
    <button className="push-button" onClick={() => toggleOverlay('share', 'show')}>Share beat!</button>
  );
}
