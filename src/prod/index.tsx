import {EventEngine} from './EventEngine';
import {Library} from './Library';
import {BananaDrum} from './components/BananaDrum';
import ReactDOM from 'react-dom';
import React from 'react';
import {createTestEcosystem} from '../test/lib/createTestEcosystem';
import {urlEncodeNumber, urlDecodeNumber, interpretAsBaseN, convertToBaseN} from './compression';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  EventEngine.initialise();

  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  this.replaceWith(loadingMessage);
  createTestEcosystem().then(({arrangement, arrangementPlayer}) => {
    EventEngine.connect(arrangementPlayer);
    document.getElementById('welcome').remove();
    ReactDOM.render(<BananaDrum arrangementPlayer={arrangementPlayer}/>, document.getElementById('wrapper'));


    // Expose some things for testing:
    Object.assign(window, {arrangement, Library});
    Object.assign(window, {urlEncodeNumber, urlDecodeNumber, interpretAsBaseN, convertToBaseN});
  });
});
