import React from 'react';
import { createBananaDrum, createBananaDrumPlayer, createBananaDrumUi, instrumentCollection, exampleSongString } from 'bananadrum-core';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  this.replaceWith(createLoadingMessage());

  const bananaDrum = createBananaDrum(instrumentCollection, getCompressedArrangement());
  const bananaDrumPlayer = createBananaDrumPlayer(bananaDrum);
  const bananaDrumUi = createBananaDrumUi(bananaDrumPlayer, document.getElementById('wrapper'))

  // Expose some things for testing:
  const {arrangement, library} = bananaDrum;
  const {arrangementPlayer} = bananaDrumPlayer;
  Object.assign(window, {arrangement, arrangementPlayer, library, bananaDrum, bananaDrumPlayer, bananaDrumUi});
});


function createLoadingMessage() {
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  return loadingMessage;
}


function getCompressedArrangement() {
  const searchParams = new URLSearchParams(window.location.search);
  const sharedArrangement = searchParams.get('a');

  if (sharedArrangement) {
    // Want to prevent people copying the url thinking it encodes their latest changes
    removeSharedArrangementFromUrl();
    return sharedArrangement;
  }

  return exampleSongString;
}


function removeSharedArrangementFromUrl() {
  const {origin, pathname} = window.location;
  window.history.replaceState({}, '', origin + pathname);
}
