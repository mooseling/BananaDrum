/* jshint browser:true */
import {exampleArrangement} from '../../dist/test/lib/example-arrangement.js';
import {instrumentCollection} from '../../dist/test/lib/example-instruments.js';
import {ArrangementPlayer} from '../../dist/prod/ArrangementPlayer.js';
import {Library} from '../../dist/prod/Library.js';
const library = Library();

document.getElementById('load-button').addEventListener('click', function() {
  library.load(instrumentCollection).then(() => {
    const arrangementPlayer = new ArrangementPlayer(library, exampleArrangement);
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
