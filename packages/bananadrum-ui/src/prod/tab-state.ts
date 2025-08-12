import { BananaDrum, ArrangementSnapshot } from 'bananadrum-core';


// TabID is generated and saved in window.history as soon as the bundle runs
let tabId:string, stateKey:string;
initVariables();


export function initTabStateTracking(bananadrum:BananaDrum) {
  const existingState = localStorage.getItem(stateKey);

  if (existingState) {
    // If we're continuing previous work, we want to start tracking immediately
    bananadrum.topics.currentState.subscribe(() => {
      setTimeout(() => localStorage.setItem(stateKey, JSON.stringify(bananadrum.currentState)), 0)
    });
  } else {
    // If starting fresh, wait for a few changes to happen before tracking the state
    // No sense gumming up the history with nothings
    let changeCounter = 0;

    const countDownToStartTracking = () => {
      changeCounter++;
      if (changeCounter === 4) {
        bananadrum.topics.currentState.unsubscribe(countDownToStartTracking);

        // Tracking won't start until next change, here we are just turning it on.
        bananadrum.topics.currentState.subscribe(() => {
          setTimeout(() => localStorage.setItem(stateKey, JSON.stringify(bananadrum.currentState)), 0)
        });
      }
    }

    bananadrum.topics.currentState.subscribe(countDownToStartTracking);
  }
}


export function getSavedState(): ArrangementSnapshot | null {
  const stateString = localStorage.getItem(stateKey);
  if (stateString === null)
    return null;

  return JSON.parse(stateString) as ArrangementSnapshot;
}


function initVariables(): void {
  let retrievedTabId = window.history.state?.tabId;
  if (!retrievedTabId)
    retrievedTabId = sessionStorage.getItem('tabId');

  if (retrievedTabId) {
    tabId = retrievedTabId;
    stateKey = `${tabId}-state`;
  } else {
    startNewState();
  }
}


export function startNewState(): void {
  tabId = generateUniqueId();
  stateKey = `${tabId}-state`;
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
