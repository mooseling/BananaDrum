import { createBananaDrum, getSerialisedArrangementFromParams } from 'bananadrum-core';
import { createBananaDrumPlayer } from 'bananadrum-player';
import { createBananaDrumUi } from 'bananadrum-ui';
import { bateriaInstruments } from './bateria-instruments';
import { demoSongString } from './demo-song';
import { SerialisedArrangement } from 'bananadrum-core/dist/prod/serialisation/serialisers';


// Once this script is loaded, we replace "Loading..." with the load button
const loadButton = document.createElement('button');
loadButton.id = 'load-button';
loadButton.className = 'push-button';
loadButton.innerText = 'Yes!';

loadButton.addEventListener('click', function() {
  this.replaceWith(createLoadingMessage());

  const bananaDrum = createBananaDrum(bateriaInstruments, getSerialisedArrangement());
  const bananaDrumPlayer = createBananaDrumPlayer(bananaDrum);
  const bananaDrumUi = createBananaDrumUi(bananaDrumPlayer, document.getElementById('wrapper'));

  // Expose some things for testing:
  const {arrangement, library} = bananaDrum;
  const {arrangementPlayer} = bananaDrumPlayer;
  Object.assign(window, {arrangement, arrangementPlayer, library, bananaDrum, bananaDrumPlayer, bananaDrumUi});

  if (arrangement.title)
    document.title = arrangement.title + ' - Banana Drum';

  arrangement.subscribe(() => document.title = arrangement.title ? arrangement.title + ' - Banana Drum' : 'Banana Drum');
});

const loadButtonWrapper = document.createElement('div');
loadButtonWrapper.innerHTML = "<p>Ready to make some beats?</p>"
loadButtonWrapper.append(loadButton);
document.getElementById('load-button-wrapper').replaceWith(loadButtonWrapper);


function createLoadingMessage() {
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  return loadingMessage;
}


function getSerialisedArrangement(): SerialisedArrangement {
  const searchParams = new URLSearchParams(window.location.search);
  const serialisedArrangement = getSerialisedArrangementFromParams(searchParams);

  if (serialisedArrangement) {
    removeSharedArrangementFromUrl();
    return serialisedArrangement;
  }

  return {composition:demoSongString, version:2, title: ''};
}


function removeSharedArrangementFromUrl() {
  const {origin, pathname} = window.location;
  window.history.replaceState({}, '', origin + pathname);
}
