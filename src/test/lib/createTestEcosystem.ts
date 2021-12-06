import {exampleArrangement} from './example-arrangement';
import {instrumentCollection} from './example-instruments';
import {Library} from '../../prod/Library';
import {Arrangement} from '../../prod/Arrangement';
import {ArrangementPlayer} from '../../prod/ArrangementPlayer';

type Ecosystem = {
  library: Banana.Library,
  arrangement: Banana.Arrangement,
  arrangementPlayer: Banana.ArrangementPlayer
};

export async function createTestEcosystem(): Promise<Ecosystem> {
  const library = Library(instrumentCollection);
  await library.load();
  const arrangement = Arrangement(library, exampleArrangement);
  const arrangementPlayer = ArrangementPlayer(arrangement);
  return {library, arrangement, arrangementPlayer};
}
