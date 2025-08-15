import { BananaDrum, ArrangementSnapshot } from 'bananadrum-core';


// Tracking state all comes down to knowing the Tab-ID
// This is either generated for a new session, or hopefully retrieved on page load
// Once the Tab-ID is known, it can be used as a key to save things in localStorage

let tabId:string, stateKey:string, startedAtKey:string;
setOrResetStateVariables(getExistingTabId());


export function initTabStateTracking(bananadrum:BananaDrum) {
  const existingState = localStorage.getItem(stateKey);

  if (existingState) {
    // If we're continuing previous work, we want to start tracking immediatel
    bananadrum.topics.currentState.subscribe(() => setTimeout(() => saveState(bananadrum), 0));
  } else {
    // If starting fresh, wait for a few changes to happen before tracking the state
    // No sense gumming up the history with nothings
    let changeCounter = 0;

    const countDownToStartTracking = () => {
      changeCounter++;
      if (changeCounter === 5) {
        localStorage.setItem(startedAtKey, String(Date.now()));
        saveState(bananadrum);
        bananadrum.topics.currentState.unsubscribe(countDownToStartTracking);
        bananadrum.topics.currentState.subscribe(() => setTimeout(() => saveState(bananadrum), 0));
      }
    }

    bananadrum.topics.currentState.subscribe(countDownToStartTracking);
  }
}


export function getSavedState(): ArrangementSnapshot | null {
  const stateString = localStorage.getItem(stateKey);
  if (stateString === null)
    return null;

  return JSON.parse(stateString).state as ArrangementSnapshot;
}


function getExistingTabId() {
  return window.history.state?.tabId
    || sessionStorage.getItem('tabId');
}


export function setOrResetStateVariables(desiredTabId?:string): void {
  tabId = desiredTabId || generateUniqueId();
  stateKey = `state-${tabId}`;
  startedAtKey = `startedAt-${tabId}`;
  window.history.replaceState({tabId}, '');
  sessionStorage.setItem('tabId', tabId);
}


function generateUniqueId(): string {
  // We should basically always have access to crypto.randomUUID, despite tsc warnings
  if (window.crypto.randomUUID)
    return window.crypto.randomUUID();

  // Otherwise, we do our best to generate a non-clashing string
  const randomNumber1 = Math.floor(Math.random() * 10_000_000_000); // 10 characters
  const timeNow = Date.now(); // Should be 13 characters for the next 300 years or so

  // TODO: Check localStorage to see if this key is used. Simple.

  return `${randomNumber1}-${timeNow}`; // 24 characters
}


function saveState(bananadrum:BananaDrum): void {
  const updatedAt = Date.now();
  const state = bananadrum.currentState;
  localStorage.setItem(stateKey, JSON.stringify({state, updatedAt}));
}
