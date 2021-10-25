import {createExamplePlayer} from './example-player.js';

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
