import {getEventEngine} from './EventEngine';
import ReactDOM from 'react-dom';
import React from 'react';
import {unpackArrangement} from './Arrangement.js';
import {createArrangementPlayer} from './ArrangementPlayer.js';
import {Library} from './Library.js';
import {HistoryController} from './HistoryController.js';
import {KeyboardHandler} from './KeyboardHandler.js';
import {BananaDrumViewer} from './components/BananaDrumViewer.js';
import {instrumentCollection} from '../test/lib/example-instruments.js';
import {exampleSongString} from '../test/lib/example-arrangement.js';
import {urlDecodeArrangement} from './compression.js';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  HistoryController.init();
  KeyboardHandler.init();

  this.replaceWith(createLoadingMessage());

  const {arrangement, arrangementPlayer} = getArrangementAndPlayer();
  getEventEngine().connect(arrangementPlayer);
  document.getElementById('welcome').remove();
  ReactDOM.render(
    <BananaDrumViewer arrangementPlayer={arrangementPlayer}/>,
    document.getElementById('wrapper')
  );

  // Expose some things for testing:
  Object.assign(window, {arrangement, arrangementPlayer});
});


function createLoadingMessage():HTMLDivElement {
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  return loadingMessage;
}


function getArrangementAndPlayer() {
  const sharedArrangement = getSharedArrangement();
  let encodedArrangement:string;
  if (sharedArrangement) {
    encodedArrangement = sharedArrangement;
    // Want to prevent people copying the url thinking it encodes their latest changes
    removeSharedArrangementFromUrl();
  } else {
    encodedArrangement = exampleSongString;
  }

  Library.load(instrumentCollection);
  const packedArrangement = urlDecodeArrangement(encodedArrangement);
  const arrangement = unpackArrangement
  (packedArrangement);
  const arrangementPlayer = createArrangementPlayer(arrangement);
  return {arrangement, arrangementPlayer};
}


function getSharedArrangement(): string|null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('a');
}


function removeSharedArrangementFromUrl(): void {
  const {origin, pathname} = window.location;
  window.history.replaceState({}, '', origin + pathname);
}


// Expose functions for testing
Object.assign(window, {Library});
