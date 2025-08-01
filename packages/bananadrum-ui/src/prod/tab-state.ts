import { BananaDrum, ArrangementSnapshot } from 'bananadrum-core';


// TabID is generated and saved in window.history as soon as the bundle runs
let tabId:string, stateKey:string;
initVariables();


export function initTabStateTracking(bananadrum:BananaDrum) {
  bananadrum.topics.currentState.subscribe(() => {
    setTimeout(() => localStorage.setItem(stateKey, JSON.stringify(bananadrum.currentState)), 0)
  });
}


export function getSavedState(): ArrangementSnapshot | null {
  const stateString = localStorage.getItem(stateKey);
  if (stateString === null)
    return null;

  return JSON.parse(stateString) as ArrangementSnapshot;
}


function initVariables(): void {
  const tabIdInHistoryState = window.history.state?.tabId;
  if (tabIdInHistoryState) {
    tabId = tabIdInHistoryState;
    setStateKey();
  } else {
    startNewState();
  }
  // TODO: Investigate also saving tabID into sessionStorage, which might cover some other browser cases
}


export function startNewState(): void {
  tabId = generateUniqueId();
  setStateKey();
  window.history.replaceState({tabId}, '');
}


function setStateKey(): void {
  stateKey = `${tabId}-state`;
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
