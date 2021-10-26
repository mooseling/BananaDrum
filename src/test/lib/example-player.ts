import {exampleArrangement} from './example-arrangement';
import {instrumentCollection} from './example-instruments';
import {Library} from '../../prod/Library';
import {Arrangement} from '../../prod/Arrangement';
import {ArrangementPlayer} from '../../prod/ArrangementPlayer';



export async function createExamplePlayer(): Promise<ArrangementPlayer> {
  const library:Library = Library(instrumentCollection);
  await library.load();
  const arrangement:Arrangement = Arrangement(library, exampleArrangement);
  const arrangementPlayer:ArrangementPlayer = ArrangementPlayer(arrangement);
  return arrangementPlayer;
}
