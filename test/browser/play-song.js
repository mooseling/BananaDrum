import {exampleArrangement} from '../../dist/test/lib/example-arrangement.js';
import {instrumentCollection} from '../../dist/test/lib/example-instruments.js';
import {ArrangementPlayer} from '../../dist/prod/ArrangementPlayer.js';
import {Library} from '../../dist/prod/Library.js';
const library = Library();

document.addEventListener('click', () => {
  library.load(instrumentCollection).then(() => {
    const arrangementPlayer = new ArrangementPlayer(library, exampleArrangement);
    arrangementPlayer.loop();
    arrangementPlayer.play();
  });
});
