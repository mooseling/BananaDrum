import {EventEngine} from './EventEngine';
import {Library} from './Library';
import {ArrangementViewer} from './components/ArrangementViewer';
import ReactDOM from 'react-dom';
import React from 'react';
import {createTestEcosystem} from '../test/lib/createTestEcosystem';

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
    arrangementPlayer.loop();
    ReactDOM.render(<ArrangementViewer arrangementPlayer={arrangementPlayer}/>, document.getElementById('wrapper'));

    document.getElementById('explanation').remove();
    loadingMessage.remove();

    // Expose some things for testing:
    // @ts-ignore
    window.arrangement = arrangement;
    // @ts-ignore
    window.Library = Library;
  });
});
