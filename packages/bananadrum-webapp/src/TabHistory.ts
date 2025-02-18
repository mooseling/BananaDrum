import { serialiseArrangement } from 'bananadrum-core/src/prod/serialisation.js';
import { BananaDrum } from 'bananadrum-core/src/prod/types.js';


const SESSION_STATE_KEY = 'banana_last_state';


export function init(bananaDrum:BananaDrum): void {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden')
      sessionStorage[SESSION_STATE_KEY] = serialiseArrangement(bananaDrum.arrangement);
  });
}


export function getLastState(): string {
  return sessionStorage[SESSION_STATE_KEY];
}