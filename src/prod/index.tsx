import {AudioPlayer} from './AudioPlayer';
import {ArrangementViewer} from './components/ArrangementViewer';
import ReactDOM from 'react-dom';
import React from 'react';
import {createTestEcosystem} from '../test/lib/createTestEcosystem';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  AudioPlayer.initialise();

  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.innerText = 'Loading...';
  this.replaceWith(loadingMessage);
  createTestEcosystem().then(({arrangement, arrangementPlayer}) => {
    AudioPlayer.connect(arrangementPlayer);
    arrangementPlayer.loop();
    ReactDOM.render(<ArrangementViewer arrangement={arrangement} arrangementPlayer={arrangementPlayer}/>, document.getElementById('wrapper'));
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');

    playButton.addEventListener('click', () => AudioPlayer.play());
    pauseButton.addEventListener('click', () => AudioPlayer.pause());
    playButton.style.display = '';
    pauseButton.style.display = '';

    document.getElementById('explanation').innerHTML = 'To edit the song, click the boxes.'

    // @ts-ignore
    window.arrangement = arrangement;

    loadingMessage.remove();
  });
});
