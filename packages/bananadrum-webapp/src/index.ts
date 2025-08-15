import { ArrangementSnapshot, createBananaDrum, deserialiseArrangement, getLibrary, getSerialisedArrangementFromParams, SerialisedArrangement } from 'bananadrum-core';
import { createBananaDrumPlayer } from 'bananadrum-player';
import { createBananaDrumUi, getSessionSnapshot, resetSessionVariables } from 'bananadrum-ui';
import { bateriaInstruments } from './bateria-instruments';
import { demoSongString } from './demo-song';


const loadButtonWrapper = document.createElement('div');

// We need to know if there's a shared beat, or a beat to reload in this tab, or neither
const sharedArrangement = getSharedArrangement();
if (sharedArrangement) {
  // We don't need to reset the tab-ID, we are expecting this to be a new tab
  loadButtonWrapper.innerHTML = "<p>Ready to load this beat?</p>"

  showBeatTitle(loadButtonWrapper, sharedArrangement.title);

  const loadButton = createButton('Yes!');
  loadButton.addEventListener('click', () => load(sharedArrangement));
  loadButtonWrapper.append(loadButton);
} else {
  const sessionSnapshot = getSessionSnapshot();
  const demoArrangement = {composition:demoSongString, version:2, title: ''};

  if (sessionSnapshot) {
    loadButtonWrapper.innerHTML = "<p>There was already a beat in this tab. Load it?</p>"

    showBeatTitle(loadButtonWrapper, sessionSnapshot.title);

    const loadSnapshotButton = createButton('Continue beat');
    loadSnapshotButton.addEventListener('click', () => load(sessionSnapshot));
    loadButtonWrapper.append(loadSnapshotButton);

    const loadDemoButton = createButton('Start fresh');
    loadDemoButton.addEventListener('click', () => {
      resetSessionVariables();
      load(demoArrangement);
    });
    loadDemoButton.style.marginLeft = '8pt'
    loadButtonWrapper.append(loadDemoButton);
  } else {
    loadButtonWrapper.innerHTML = "<p>Ready to make some beats?</p>"
    const loadButton = createButton('Yes!');
    loadButton.addEventListener('click', () => load(demoArrangement));
    loadButtonWrapper.append(loadButton);
  }
}

document.getElementById('load-button-wrapper').replaceWith(loadButtonWrapper);


function createLoadingMessage() {
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  return loadingMessage;
}


function getSharedArrangement(): SerialisedArrangement {
  const searchParams = new URLSearchParams(window.location.search);
  const serialisedArrangement = getSerialisedArrangementFromParams(searchParams);

  if (serialisedArrangement) {
    removeSharedArrangementFromUrl();
    return serialisedArrangement;
  }
}


function removeSharedArrangementFromUrl() {
  const {origin, pathname} = window.location;
  window.history.replaceState({}, '', origin + pathname);
}


function createButton(innerText:string): HTMLButtonElement {
  const button = document.createElement('button');
  button.classList.add('push-button');
  button.innerText = innerText

  return button;
}


function load(arrangementToLoad:ArrangementSnapshot|SerialisedArrangement) {
  loadButtonWrapper.replaceWith(createLoadingMessage());

  const library = getLibrary();
  library.load(bateriaInstruments);

  if ('composition' in arrangementToLoad)
    arrangementToLoad = deserialiseArrangement(arrangementToLoad)

  const bananaDrum = createBananaDrum(library, arrangementToLoad);
  const bananaDrumPlayer = createBananaDrumPlayer(bananaDrum);
  const bananaDrumUi = createBananaDrumUi(bananaDrumPlayer, document.getElementById('wrapper'));

  // Expose some things for testing:
  const {arrangement} = bananaDrum;
  const {arrangementPlayer} = bananaDrumPlayer;
  Object.assign(window, {arrangement, arrangementPlayer, library, bananaDrum, bananaDrumPlayer, bananaDrumUi});

  if (arrangement.title)
    document.title = arrangement.title + ' - Banana Drum';

  arrangement.subscribe(() => document.title = arrangement.title ? arrangement.title + ' - Banana Drum' : 'Banana Drum');
}


function showBeatTitle(wrapper:HTMLDivElement, title:string): void {
  if (title) {
    const titleElement = document.createElement('h4');
    titleElement.innerText = title;
    loadButtonWrapper.append(titleElement);
  }
}
