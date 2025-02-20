import { anyOverlaysAreOpen, closeAllOverlays } from './components/Overlay';
import { isMobile } from './isMobile';


export function initMobileSupport(): void {
  if (isMobile) {
    window.history.pushState({}, '');
    window.addEventListener('popstate', () => {
      // Mobile back button is a natural button for closing overlays
      if (anyOverlaysAreOpen()) {
        closeAllOverlays();
        window.history.pushState({}, '');
      } else {
        window.history.back();
      }
    });
}
}