import { BananaDrum, serialiseArrangement } from 'bananadrum-core';


const SESSION_STATE_KEY = 'banana_last_state';


export function initTabHistoryTracking(bananaDrum:BananaDrum): void {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden')
      sessionStorage[SESSION_STATE_KEY] = serialiseArrangement(bananaDrum.arrangement);
  });

  // The visibility listener above covers most cases, meaning this next listener is usually pointless work
  // However, it solves the "close/reopen tab" case on Firefox
  window.addEventListener('beforeunload',() => {
    sessionStorage[SESSION_STATE_KEY] = serialiseArrangement(bananaDrum.arrangement);
  });
}


export function getLastHistoryEntry(): string {
  return sessionStorage[SESSION_STATE_KEY];
}