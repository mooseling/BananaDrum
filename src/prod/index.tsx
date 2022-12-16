import {EventEngine} from './EventEngine';
import {Arrangement} from './Arrangement';
import {ArrangementPlayer} from './ArrangementPlayer';
import {Library} from './Library';
import {HistoryController} from './HistoryController';
import {KeyboardHandler} from './KeyboardHandler';
import {BananaDrum} from './components/BananaDrum';
import ReactDOM from 'react-dom';
import React from 'react';
import {instrumentCollection} from '../test/lib/example-instruments';
import {exampleSongString} from '../test/lib/example-arrangement';
import {urlDecodeArrangement} from './compression';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  HistoryController.init();
  KeyboardHandler.init();

  this.replaceWith(createLoadingMessage());

  const {arrangement, arrangementPlayer} = getArrangementAndPlayer();
  EventEngine.connect(arrangementPlayer);
  document.getElementById('welcome').remove();
  ReactDOM.render(
    <BananaDrum arrangementPlayer={arrangementPlayer}/>,
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
  const arrangement = Arrangement.unpack(packedArrangement);
  const arrangementPlayer = ArrangementPlayer(arrangement);
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
