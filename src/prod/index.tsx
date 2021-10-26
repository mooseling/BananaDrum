import {ArrangementViewer} from './components/ArrangementViewer';
import ReactDOM from 'react-dom';
import React from 'react';
import {createExamplePlayer} from '../test/lib/example-player';

// Set React to global so we don't have to import it in every file with JSX
// A benefit of this is to supress TS messages about unused var React
window.React = React;


document.getElementById('load-button').addEventListener('click', function() {
  createExamplePlayer().then(arrangementPlayer => {
    arrangementPlayer.loop();
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');

    playButton.addEventListener('click', () => arrangementPlayer.play());
    pauseButton.addEventListener('click', () => arrangementPlayer.pause());
    playButton.style.display = '';
    pauseButton.style.display = '';

    this.remove();
  });
});

ReactDOM.render(<ArrangementViewer/>, document.getElementById('wrapper'));
