import {exampleArrangement} from '../lib/example-arrangement.js';
import {ArrangementPlayer} from '../../dist/ArrangementPlayer.js';

document.addEventListener('click', () => {
  const arrangementPlayer = new ArrangementPlayer();
  arrangementPlayer.load(exampleArrangement);
  arrangementPlayer.play();
});
