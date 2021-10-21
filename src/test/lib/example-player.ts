import {exampleArrangement} from './example-arrangement.js';
import {instrumentCollection} from './example-instruments.js';
import {Library} from '../../prod/Library.js';
import {Arrangement} from '../../prod/Arrangement.js';
import {ArrangementPlayer} from '../../prod/ArrangementPlayer.js';



export async function createExamplePlayer(): Promise<ArrangementPlayer> {
  const library:Library = Library(instrumentCollection);
  await library.load();
  const arrangement:Arrangement = Arrangement(library, exampleArrangement);
  const arrangementPlayer:ArrangementPlayer = ArrangementPlayer(arrangement);
  return arrangementPlayer;
}
