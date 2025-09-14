import { ArrangementSnapshot, createBananaDrum, deserialiseArrangement, getLibrary, getSerialisedArrangementFromParams, SerialisedArrangement } from 'bananadrum-core';
import { createBananaDrumPlayer } from 'bananadrum-player';
import { areAnySavedSessions, createBananaDrumUi, getSessionList, getSessionSnapshot, resetSessionVariables } from 'bananadrum-ui';
import { bateriaInstruments } from './bateria-instruments';
import { demoSongString } from './demo-song';


// When this script executes, we update the existing DOM to show the "go!" button
(function () {
  // On Firefox iOS, on close/reopen, the DOM is reloaded from cache, but the script executes again
  // We need to prevent that, so we check if the DOM is in the initial state first
  const loadingMessageWrapper = document.getElementById('loading-message-wrapper');
  if (!loadingMessageWrapper)
    return;

  const loadButtonWrapper = document.createElement('div');

  // We need to know if there's a shared beat, or a beat to reload in this tab, or neither
  const sharedArrangement = getSharedArrangement();
  if (sharedArrangement) {
    // We don't need to reset the tab-ID, we are expecting this to be a new tab
    loadButtonWrapper.innerHTML = "<p>Ready to load this beat?</p>"

    showBeatTitle(loadButtonWrapper, sharedArrangement.title);

    const loadButton = createButton('Yes!');
    loadButton.addEventListener('click', () => load(loadButtonWrapper, sharedArrangement));
    loadButtonWrapper.append(loadButton);
  } else {
    const sessionSnapshot = getSessionSnapshot();
    const demoArrangement = {composition:demoSongString, version:2, title: ''};

    if (sessionSnapshot) {
      loadButtonWrapper.innerHTML = "<p>You've got a beat here. Pick up where you left off?</p>"

      showBeatTitle(loadButtonWrapper, sessionSnapshot.title);

      const loadSnapshotButton = createButton('Continue beat');
      loadSnapshotButton.addEventListener('click', () => load(loadButtonWrapper, sessionSnapshot));
      loadButtonWrapper.append(loadSnapshotButton);

      const loadDemoButton = createButton('Start fresh');
      loadDemoButton.addEventListener('click', () => {
        resetSessionVariables();
        load(loadButtonWrapper, demoArrangement);
      });
      loadDemoButton.style.marginLeft = '8pt'
      loadButtonWrapper.append(loadDemoButton);
    } else {
      const loadButton = createButton('Start!');
      loadButton.classList.add('shiny');
      loadButton.addEventListener('click', () => load(loadButtonWrapper, demoArrangement));
      loadButtonWrapper.append(loadButton);
    }
  }

  loadingMessageWrapper.replaceWith(loadButtonWrapper);

  if(areAnySavedSessions()) {
    document.getElementById('if-old-beats').classList.remove('hidden');
    document.getElementById('toggle-old-beats').addEventListener('click', () => {
      const oldSessions = getSessionList();
      const oldBeatTemplate = document.getElementById('old-beat-template') as HTMLTemplateElement;
      const wrapper = document.createElement('div');

      oldSessions.forEach(oldSession => {
        const oldBeatDiv = oldBeatTemplate.content.cloneNode(true) as HTMLDivElement;
        const updatedAt = new Date(oldSession.updatedAt);
        const startedAt = new Date(oldSession.startedAt);
        const title = oldSession.state.title;
        oldBeatDiv.innerText = `${title || 'No title'} - Created ${startedAt.toLocaleDateString()} ${startedAt.toLocaleTimeString()} - Updated ${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`
        oldBeatDiv.addEventListener('click', () => {
          resetSessionVariables(); // TODO - use session ID here. Or not? We can have clashes if we do.
          load(loadButtonWrapper, oldSession.state);
        });
        wrapper.append(oldBeatDiv);
      });

      document.getElementById('old-beats').replaceChildren(wrapper);
      document.getElementById('old-beats').classList.remove('hidden');
    });
  }
})();


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


function load(loadButtonWrapper:HTMLDivElement, arrangementToLoad:ArrangementSnapshot|SerialisedArrangement) {
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
    wrapper.append(titleElement);
  }
}
