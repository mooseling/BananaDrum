import {useContext} from 'react';
import {Library} from '../Library';
import {ArrangementPlayerContext} from './ArrangementViewer';

export function InstrumentBrowser(): JSX.Element {
  return (
    <div>
      {Library.instrumentMetas.map(meta => <InstrumentChooser instrumentMeta={meta} />)}
    </div>
  );
}


function InstrumentChooser({instrumentMeta}:{instrumentMeta:Banana.InstrumentMeta}): JSX.Element {
  const {instrumentId, displayName} = instrumentMeta;
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <button onClick={() => choose(instrumentId, arrangement)}>
      {displayName}
    </button>
  );
}


async function choose(instrumentId:string, arrangement:Banana.Arrangement) {
  const instrument = await Library.getInstrument(instrumentId);
  arrangement.createTrack(instrument);
}
