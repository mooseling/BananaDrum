import {exampleArrangement} from './example-arrangement';
import {instrumentCollection} from './example-instruments';
import {Library} from '../../prod/Library';
import {Arrangement} from '../../prod/Arrangement';
import {ArrangementPlayer} from '../../prod/ArrangementPlayer';

type Ecosystem = {
  arrangement: Banana.Arrangement,
  arrangementPlayer: Banana.ArrangementPlayer
};

export async function createTestEcosystem(): Promise<Ecosystem> {
  Library.load(instrumentCollection);
  const arrangement = await Arrangement.unpack(exampleArrangement);
  const arrangementPlayer = ArrangementPlayer(arrangement);
  return {arrangement, arrangementPlayer};
}
