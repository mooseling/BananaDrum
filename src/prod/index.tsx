import {EventEngine} from './EventEngine';
import {Arrangement} from './Arrangement';
import {ArrangementPlayer} from './ArrangementPlayer';
import {Library} from './Library';
import {BananaDrum} from './components/BananaDrum';
import ReactDOM from 'react-dom';
import React from 'react';
import {instrumentCollection} from '../test/lib/example-instruments';
import {exampleSongString} from '../test/lib/example-arrangement';
import {urlEncodeNumber, urlDecodeNumber, interpretAsBaseN, convertToBaseN, urlEncodeTrack, urlEncodeArrangement, urlDecodeArrangement} from './compression';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  EventEngine.initialise();
  this.replaceWith(createLoadingMessage());

  getArrangementAndPlayer().then(({arrangement, arrangementPlayer}) => {
    EventEngine.connect(arrangementPlayer);
    document.getElementById('welcome').remove();
    ReactDOM.render(
      <BananaDrum arrangementPlayer={arrangementPlayer}/>,
      document.getElementById('wrapper')
    );

    // Expose some things for testing:
    Object.assign(window, {arrangement, arrangementPlayer});
  });
});


function createLoadingMessage():HTMLDivElement {
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  return loadingMessage;
}


async function getArrangementAndPlayer() {
  const encodedArrangement = getUrlEncodedArrangement() ?? exampleSongString;
  Library.load(instrumentCollection);
  const packedArrangement = urlDecodeArrangement(encodedArrangement);
  const arrangement = await Arrangement.unpack(packedArrangement);
  const arrangementPlayer = ArrangementPlayer(arrangement);
  return {arrangement, arrangementPlayer};
}


function getUrlEncodedArrangement(): string|null {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('a');
}


// Expose functions for testing
Object.assign(window, {Library, urlEncodeNumber, urlDecodeNumber, interpretAsBaseN, convertToBaseN, urlEncodeTrack, urlEncodeArrangement, urlDecodeArrangement});
