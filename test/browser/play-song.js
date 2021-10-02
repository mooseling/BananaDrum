import {exampleArrangement} from '../lib/example-arrangement.js';
import {instrumentCollection} from '../lib/example-instruments.js';
import {ArrangementPlayer} from '../../dist/ArrangementPlayer.js';
import * as Library from '../../dist/Library.js';

document.addEventListener('click', () => {
  Library.load(instrumentCollection);
  const arrangementPlayer = new ArrangementPlayer();
  arrangementPlayer.load(exampleArrangement);
  arrangementPlayer.play();
});
