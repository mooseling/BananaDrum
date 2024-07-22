import { createBananaDrum } from 'bananadrum-core';
import { createBananaDrumPlayer } from 'bananadrum-player';
import { createBananaDrumUi } from 'bananadrum-ui';
import { bateriaInstruments } from './bateria-instruments';
import { demoSongString } from './demo-song';


document.getElementById('load-button').addEventListener('click', function() {
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


function createLoadingMessage() {
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  return loadingMessage;
}


function getSerialisedArrangement() {
  const searchParams = new URLSearchParams(window.location.search);

  const title = searchParams.get('t') || undefined; // SearchParams.get can return null, but we prefer undefined

  const sharedArrangement2 = searchParams.get('a2');
  if (sharedArrangement2) {
    // Want to prevent people copying the url thinking it encodes their latest changes
    removeSharedArrangementFromUrl();
    return {serialisedArrangement:sharedArrangement2, version:2, title};
  }

  const sharedArrangementV1 = searchParams.get('a');
  if (sharedArrangementV1) {
    removeSharedArrangementFromUrl();
    return {serialisedArrangement:sharedArrangementV1, version:1, title};
  }

  return {serialisedArrangement:demoSongString, version:2, title};
}


function removeSharedArrangementFromUrl() {
  const {origin, pathname} = window.location;
  window.history.replaceState({}, '', origin + pathname);
}
