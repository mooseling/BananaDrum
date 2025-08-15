import { BananaDrum, ArrangementSnapshot } from 'bananadrum-core';


// Tracking state all comes down to knowing the Session ID
// This is either generated for a new session, or hopefully retrieved on page load
// Once the Session ID is known, it can be used as a key to save things in localStorage

let sessionId:string, stateKey:string, startedAtKey:string;
resetSessionVariables(getExistingSessionId());


export function initSessionRecovery(bananadrum:BananaDrum) {
  const existingState = localStorage.getItem(stateKey);

  if (existingState) {
    // If we're continuing previous work, we want to start tracking immediately
    bananadrum.topics.currentState.subscribe(() => setTimeout(() => saveSession(bananadrum), 0));
  } else {
    // If starting fresh, wait for a few changes to happen before tracking the state
    // No sense gumming up the history with nothings
    let changeCounter = 0;

    const countDownToStartSaving = () => {
      changeCounter++;
      if (changeCounter === 5) {
        localStorage.setItem(startedAtKey, String(Date.now()));
        saveSession(bananadrum);
        bananadrum.topics.currentState.unsubscribe(countDownToStartSaving);
        bananadrum.topics.currentState.subscribe(() => setTimeout(() => saveSession(bananadrum), 0));
      }
    }

    bananadrum.topics.currentState.subscribe(countDownToStartSaving);
  }
}


export function getSessionSnapshot(): ArrangementSnapshot | null {
  const stateString = localStorage.getItem(stateKey);
  if (stateString === null)
    return null;

  return JSON.parse(stateString).state as ArrangementSnapshot;
}


// Will return something falsey if this is a new session
function getExistingSessionId(): string | null {
  return window.history.state?.sessionId
    || sessionStorage.getItem('sessionId');
}


export function resetSessionVariables(desiredSessionId?:string): void {
  sessionId = desiredSessionId || generateUniqueId();
  stateKey = `state-${sessionId}`;
  startedAtKey = `startedAt-${sessionId}`;
  window.history.replaceState({sessionId}, '');
  sessionStorage.setItem('sessionId', sessionId);
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


function saveSession(bananadrum:BananaDrum): void {
  const updatedAt = Date.now();
  const state = bananadrum.currentState;
  localStorage.setItem(stateKey, JSON.stringify({state, updatedAt}));
}
