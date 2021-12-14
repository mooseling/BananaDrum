import {useContext} from 'react';
import {Library} from '../Library';
import {ArrangementPlayerContext} from './ArrangementViewer';

export function InstrumentBrowser({close}:{close:() => void}): JSX.Element {
  return (
    <div>
      {Library.instrumentMetas.map(meta => <InstrumentChooser instrumentMeta={meta} close={close}/>)}
    </div>
  );
}


function InstrumentChooser({instrumentMeta, close}:{instrumentMeta:Banana.InstrumentMeta, close:() => void}): JSX.Element {
  const {instrumentId, displayName} = instrumentMeta;
  const arrangement:Banana.Arrangement = useContext(ArrangementPlayerContext).arrangement;
  return (
    <button onClick={() => choose(instrumentId, arrangement) && close()}>
      {displayName}
    </button>
  );
}


async function choose(instrumentId:string, arrangement:Banana.Arrangement) {
  const instrument = await Library.getInstrument(instrumentId);
  arrangement.createTrack(instrument);
}
